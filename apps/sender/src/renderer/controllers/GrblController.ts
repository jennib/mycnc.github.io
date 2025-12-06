import { MachineState, ConnectionOptions, MachineSettings, PortInfo } from "@mycnc/shared";
import { Controller } from './Controller';
import { SerialService } from '../services/serialService';
import { parseGrblStatus, parseGrblParserState } from '../services/grblParser';
import { GrblSimulator } from '../services/simulators/GrblSimulator';
import { EventEmitter } from '../utils/EventEmitter';

export class GrblController implements Controller {
    private emitter = new EventEmitter<'data' | 'state' | 'error' | 'progress' | 'job'>();
    private serialService: SerialService;
    settings: MachineSettings;

    isHandshakeInProgress = false;
    isDisconnecting = false;

    // Job state
    private isJobRunning = false;
    private isPaused = false;
    private jobAbortController: AbortController | null = null;

    linePromiseResolve: (() => void) | null = null;
    linePromiseReject: ((reason?: any) => void) | null = null;
    lastStatus: MachineState = {
        status: 'Idle',
        code: undefined,
        wpos: { x: 0, y: 0, z: 0 },
        mpos: { x: 0, y: 0, z: 0 },
        wco: { x: 0, y: 0, z: 0 },
        wcs: 'G54',
        spindle: { state: 'off', speed: 0 },
        ov: [100, 100, 100],
    };
    statusInterval: number | null = null;
    normalPollingRate = 1000;
    alarmPollingRate = 1000;
    isPollingInAlarmState = false;

    constructor(settings: MachineSettings) {
        this.settings = settings;
        this.serialService = new SerialService({
            onData: this.processIncomingData.bind(this),
            onError: (error) => this.emitter.emit('error', error),
        });
    }

    async connect(options: ConnectionOptions): Promise<void> {
        if (this.serialService.isConnected) {
            throw new Error("A connection attempt is already in progress.");
        }

        this.isHandshakeInProgress = true;
        try {
            let portInfo: PortInfo;
            if (options.type === 'simulator') {
                const simulator = new GrblSimulator();
                portInfo = await this.serialService.connectSimulator(simulator);
            } else {
                portInfo = await this.serialService.connect(options);
            }

            // Reset state for new connection
            this.lastStatus = {
                status: 'Idle',
                code: undefined,
                wpos: { x: 0, y: 0, z: 0 },
                mpos: { x: 0, y: 0, z: 0 },
                wco: { x: 0, y: 0, z: 0 },
                wcs: 'G54',
                spindle: { state: 'off', speed: 0 },
                ov: [100, 100, 100],
            };

            // Add a short delay to allow the serial port to initialize fully
            await new Promise(resolve => setTimeout(resolve, 1000));

            // GRBL Handshake: Send a soft-reset to get the welcome message
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("Connection timed out. No GRBL welcome message received."));
                }, 2500); // 2.5 second timeout

                const dataListener = (data: any) => {
                    const payload = typeof data === 'string' ? data : data?.message;
                    if (payload && payload.toLowerCase().includes('grbl')) {
                        clearTimeout(timeout);
                        this.off('data', dataListener);
                        resolve();
                    }
                };
                this.on('data', dataListener);

                // Send soft-reset character (Ctrl-X)
                this.sendRealtimeCommand('\x18');
            });

            this.isHandshakeInProgress = false;

            this.emitter.emit('state', { type: 'connect', data: portInfo });

            this.statusInterval = window.setInterval(() => this.requestStatusUpdate(), this.normalPollingRate);
            this.isPollingInAlarmState = false;

            // Request initial parser state (for WCS)
            this.sendRealtimeCommand('$G');

        } catch (error) {
            this.isHandshakeInProgress = false;
            if (this.serialService.isConnected) {
                await this.disconnect();
            }
            throw error;
        }
    }

    disconnect(): void {
        if (this.isDisconnecting || !this.serialService.isConnected) return;
        this.isDisconnecting = true;

        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }

        // If a command is pending, reject it.
        if (this.linePromiseReject) {
            this.linePromiseReject(new Error('Connection disconnected.'));
            this.linePromiseResolve = null;
            this.linePromiseReject = null;
        }

        try {
            this.serialService.disconnect();
        } catch (error) {
            console.error("Error during disconnect:", error);
        } finally {
            this.isDisconnecting = false;
            this.emitter.emit('state', { type: 'disconnect' });
        }
    }

    processIncomingData(line: string) {
        const trimmedValue = line.trim();
        if (trimmedValue.startsWith('<') && trimmedValue.endsWith('>')) {
            const statusUpdate = parseGrblStatus(trimmedValue, this.lastStatus);
            if (statusUpdate) {
                this.lastStatus = {
                    ...this.lastStatus,
                    ...statusUpdate
                };

                this.emitter.emit('state', { type: 'state', data: this.lastStatus });
            }
        } else if (trimmedValue.startsWith('[GC:') && trimmedValue.endsWith(']')) {
            const parserState = parseGrblParserState(trimmedValue);
            if (parserState) {
                this.lastStatus = {
                    ...this.lastStatus,
                    ...parserState
                };
                this.emitter.emit('state', { type: 'state', data: this.lastStatus });
            }
        } else if (trimmedValue) {
            if (trimmedValue.toLowerCase().startsWith('alarm:')) {
                const alarmCode = parseInt(trimmedValue.split(':')[1], 10);
                this.lastStatus = {
                    ...this.lastStatus,
                    status: 'Alarm',
                    code: isNaN(alarmCode) ? undefined : alarmCode
                };
                this.emitter.emit('state', { type: 'state', data: this.lastStatus });
                this.emitter.emit('data', { type: 'received', message: trimmedValue });
            } else if (trimmedValue.startsWith('error:')) {
                if (this.linePromiseReject) {
                    this.linePromiseReject(new Error(trimmedValue));
                    this.linePromiseResolve = null;
                    this.linePromiseReject = null;
                } else {
                    this.emitter.emit('error', 'GRBL Error: ' + trimmedValue);
                }
            }
            else {
                this.emitter.emit('data', { type: 'received', message: trimmedValue });
                if (trimmedValue.startsWith('ok')) {
                    if (this.linePromiseResolve) {
                        this.linePromiseResolve();
                        this.linePromiseResolve = null;
                        this.linePromiseReject = null;
                    }
                }
            }
        }
    }

    async sendCommand(command: string, timeout = 60000): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (this.linePromiseResolve) {
                return reject(new Error("Cannot send new line while another is awaiting 'ok'."));
            }

            this.emitter.emit('data', { type: 'sent', message: command });

            const timeoutId = setTimeout(() => {
                this.linePromiseResolve = null;
                this.linePromiseReject = null;
                reject(new Error('Command timed out after ' + (timeout / 1000) + 's: ' + command));
            }, timeout);

            this.linePromiseResolve = () => {
                clearTimeout(timeoutId);
                resolve('ok');
            };

            this.linePromiseReject = (reason) => {
                clearTimeout(timeoutId);
                reject(reason);
            };

            this.serialService.send(command + '\n').catch(err => {
                this.linePromiseReject?.(err);
            });
        });
    }

    sendRealtimeCommand(command: string): void {
        this.serialService.send(command);
    }

    private pollCount = 0;

    requestStatusUpdate() {
        this.sendRealtimeCommand('?');

        // Poll parser state ($G) every 2 seconds (approx) to keep WCS and other modes in sync.
        // Only send if no other command is pending to avoid 'ok' response collision.
        this.pollCount++;
        if (this.pollCount % 2 === 0) {
            if (!this.linePromiseResolve) {
                this.serialService.send('$G\n').catch(err => {
                    console.error('Failed to poll parser state:', err);
                });
            }
        }
    }

    jog(x: number, y: number, z: number, feedRate: number): void {
        const command = '$J=G91 X' + x + ' Y' + y + ' Z' + z + ' F' + feedRate;
        this.sendCommand(command);
    }

    home(axis: 'all' | 'x' | 'y' | 'z'): void {
        if (axis === 'all') {
            this.sendCommand('$H');
        }
    }

    emergencyStop(): void {
        this.stopJob();
        this.sendRealtimeCommand('\x18');
    }

    macros: import('@mycnc/shared').Macro[] = [];

    setMacros(macros: import('@mycnc/shared').Macro[]) {
        this.macros = macros;
    }

    async sendGCode(lines: string[], options: { startLine?: number; isDryRun?: boolean } = {}) {
        if (this.isJobRunning) return;
        this.isJobRunning = true;
        this.isPaused = false;
        this.jobAbortController = new AbortController();
        const { signal } = this.jobAbortController;

        const startLine = options.startLine || 0;
        let lastToolNumber: number | null = null;

        // Notify start?

        for (let i = startLine; i < lines.length; i++) {
            if (signal.aborted) break;

            // Handle pause
            while (this.isPaused) {
                if (signal.aborted) break;
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            if (signal.aborted) break;

            const line = lines[i];

            // Track Tool Number (Txx)
            const tMatch = line.match(/T(\d+)/i);
            if (tMatch) {
                lastToolNumber = parseInt(tMatch[1], 10);
            }

            // M6 Interception
            const m6Match = line.match(/(^|\s)(M6)(\s|$)/i);
            if (m6Match && this.settings.toolChangePolicy === 'macro' && this.settings.toolChangeMacroId) {
                const macro = this.macros.find(m => m.name === this.settings.toolChangeMacroId); // Using ID/Name? Assuming name for now based on MachineSettings change or ID?
                // Wait, I added toolChangeMacroId. In App logic, macros have name but maybe no ID property?
                // Checked types: Macro has name, description, commands. No ID. So `toolChangeMacroId` is likely the NAME.
                // Let's assume toolChangeMacroId holds the macro NAME.

                if (macro) {
                    this.emitter.emit('data', { type: 'info', message: `Intercepting M6: Running Macro '${macro.name}' (Tool: ${lastToolNumber ?? 'Unknown'})` });

                    for (const macroLine of macro.commands) {
                        if (signal.aborted) break;
                        // Variable Substitution
                        let processedLine = macroLine;
                        if (lastToolNumber !== null) {
                            processedLine = processedLine.replace(/{tool}/g, lastToolNumber.toString());
                        }

                        try {
                            await this.sendCommand(processedLine);
                        } catch (error) {
                            this.emitter.emit('error', `Macro error: ${error}`);
                            this.stopJob();
                            return; // Exit job
                        }
                    }

                    // Skip sending the original M6 line
                    this.emitter.emit('progress', {
                        percentage: ((i + 1) / lines.length) * 100,
                        linesSent: i + 1,
                        totalLines: lines.length
                    });
                    // Yield to event loop
                    if (i % 20 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                    continue;
                }
            }


            try {
                // If dry run, maybe skip commands or just send them?
                // GRBL check mode ($C) is better for dry run.
                // But for now let's just send them.
                await this.sendCommand(line);

                this.emitter.emit('progress', {
                    percentage: ((i + 1) / lines.length) * 100,
                    linesSent: i + 1,
                    totalLines: lines.length
                });

                // Yield to the event loop every 20 lines to prevent UI freezing
                if (i % 20 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            } catch (error) {
                this.emitter.emit('error', 'Job error at line ' + (i + 1) + ': ' + error);
                this.stopJob();
                break;
            }
        }

        this.isJobRunning = false;
        this.jobAbortController = null;

        // Reset overrides on job completion
        this.sendRealtimeCommand('\x90'); // Reset Feed Override
        this.sendRealtimeCommand('\x99'); // Reset Spindle Override

        this.emitter.emit('job', { status: 'complete' });
    }

    // Spindle state tracking for smart resume
    private pausedSpindleState: { state: string; speed: number } | null = null;

    async refreshStatus(): Promise<MachineState> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.off('state', listener);
                reject(new Error("Timeout waiting for status update"));
            }, 2000);

            const listener = (event: { type: string, data: MachineState }) => {
                if (event.type === 'state') {
                    clearTimeout(timeout);
                    this.off('state', listener);
                    resolve(event.data);
                }
            };

            this.on('state', listener);
            this.requestStatusUpdate();
        });
    }

    async pause() {
        if (this.isJobRunning && !this.isPaused) {
            this.isPaused = true;
            // Save current spindle state before pausing
            this.pausedSpindleState = {
                state: this.lastStatus.spindle.state,
                speed: this.lastStatus.spindle.speed
            };
            this.sendRealtimeCommand('!'); // Feed Hold
        }
    }

    async resume() {
        if (this.isJobRunning && this.isPaused) {
            // Wait for any pending commands to complete (e.g. manual spindle control)
            // This prevents "Cannot send new line while another is awaiting 'ok'"
            let retries = 0;
            while (this.linePromiseResolve && retries < 50) { // Wait up to 5 seconds
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }

            try {
                // Ensure we have the latest status before making decisions
                await this.refreshStatus();
            } catch (e) {
                console.warn("Failed to refresh status before resume:", e);
            }

            // Smart Resume: Restore spindle if it was on before pause but is now off
            if (this.pausedSpindleState &&
                (this.pausedSpindleState.state === 'cw' || this.pausedSpindleState.state === 'ccw') &&
                this.lastStatus.spindle.state === 'off') {

                const { state, speed } = this.pausedSpindleState;
                const command = (state === 'cw' ? 'M3' : 'M4') + ' S' + speed;

                console.log('Smart Resume: Restoring spindle (' + command + ') and warming up...');
                await this.sendCommand(command);

                // Warm-up delay using G4 (Dwell)
                await this.sendCommand('G4 P4');
            }

            this.pausedSpindleState = null;
            this.isPaused = false;
            this.sendRealtimeCommand('~'); // Cycle Start
        }
    }

    stopJob() {
        if (this.isJobRunning) {
            this.jobAbortController?.abort();
            this.isJobRunning = false;
            this.isPaused = false;
            this.sendRealtimeCommand('\x18'); // Soft Reset
        }
    }

    on(event: 'data' | 'state' | 'error' | 'progress' | 'job', listener: (data: any) => void): void {
        this.emitter.on(event, listener);
    }

    off(event: 'data' | 'state' | 'error' | 'progress' | 'job', listener: (data: any) => void): void {
        this.emitter.off(event, listener);
    }
}
