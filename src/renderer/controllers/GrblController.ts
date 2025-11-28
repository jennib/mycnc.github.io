import { MachineState, ConnectionOptions, MachineSettings, PortInfo } from '../types';
import { Controller } from './Controller';
import { SerialService } from '../services/serialService';
import { parseGrblStatus } from '../services/grblParser';
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
                    this.emitter.emit('error', `GRBL Error: ${trimmedValue}`);
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

    async sendCommand(command: string, timeout = 10000): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (this.linePromiseResolve) {
                return reject(new Error("Cannot send new line while another is awaiting 'ok'."));
            }

            this.emitter.emit('data', { type: 'sent', message: command });

            const timeoutId = setTimeout(() => {
                this.linePromiseResolve = null;
                this.linePromiseReject = null;
                reject(new Error(`Command timed out after ${timeout / 1000}s: ${command}`));
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

    requestStatusUpdate() {
        this.sendRealtimeCommand('?');
    }

    jog(x: number, y: number, z: number, feedRate: number): void {
        const command = `$J=G91 X${x} Y${y} Z${z} F${feedRate}`;
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

    async sendGCode(lines: string[], options: { startLine?: number; isDryRun?: boolean } = {}) {
        if (this.isJobRunning) return;
        this.isJobRunning = true;
        this.isPaused = false;
        this.jobAbortController = new AbortController();
        const { signal } = this.jobAbortController;

        const startLine = options.startLine || 0;

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
            } catch (error) {
                this.emitter.emit('error', `Job error at line ${i + 1}: ${error}`);
                this.stopJob();
                break;
            }
        }

        this.isJobRunning = false;
        this.jobAbortController = null;
        this.emitter.emit('job', { status: 'complete' });
    }

    async pause() {
        if (this.isJobRunning && !this.isPaused) {
            this.isPaused = true;
            this.sendRealtimeCommand('!'); // Feed Hold
        }
    }

    async resume() {
        if (this.isJobRunning && this.isPaused) {
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


    on(event: 'data' | 'state' | 'error', listener: (data: any) => void): void {
        this.emitter.on(event, listener);
    }

    off(event: 'data' | 'state' | 'error', listener: (data: any) => void): void {
        this.emitter.off(event, listener);
    }
}
