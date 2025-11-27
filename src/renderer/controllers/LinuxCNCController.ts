import { MachineState, ConnectionOptions, MachineSettings, PortInfo } from '../types';
import { Controller } from './Controller';
import { SerialService } from '../services/serialService';
import { EventEmitter } from '../utils/EventEmitter';
import { LinuxCNCSimulator } from '../services/simulators/LinuxCNCSimulator';



/**
 * LinuxCNC Controller
 * 
 * LinuxCNC is a comprehensive CNC control system primarily for Linux.
 * This is a SIMPLIFIED implementation that assumes a network interface
 * or serial protocol for remote control.
 * 
 * Note: Full LinuxCNC integration would require:
 * - HAL (Hardware Abstraction Layer) integration
 * - INI file configuration
 * - NML (Neutral Message Language) protocol
 * - Possibly using linuxcncrsh (remote shell) protocol
 * 
 * This implementation uses a simplified command/response protocol
 * similar to GRBL for basic MDI (Manual Data Input) operations.
 */
export class LinuxCNCController implements Controller {
    private emitter = new EventEmitter<'data' | 'state' | 'error' | 'progress' | 'job'>();
    private serialService: SerialService;
    private settings: MachineSettings;

    private isConnecting = false;
    private linePromiseResolve: (() => void) | null = null;
    private linePromiseReject: ((reason?: any) => void) | null = null;

    private lastStatus: MachineState = {
        status: 'Idle',
        code: null,
        wpos: { x: 0, y: 0, z: 0 },
        mpos: { x: 0, y: 0, z: 0 },
        wco: { x: 0, y: 0, z: 0 },
        spindle: { state: 'off', speed: 0 },
        ov: [100, 100, 100],
    };

    private statusInterval: number | null = null;
    private isJobRunning = false;
    private isPaused = false;
    private jobAbortController: AbortController | null = null;

    constructor(settings?: MachineSettings) {
        this.settings = settings || {
            controllerType: 'linuxcnc',
            workArea: { x: 200, y: 200, z: 200 },
            jogFeedRate: 1000,
            spindle: { min: 0, max: 24000, warmupDelay: 0 },
            probe: { xOffset: 0, yOffset: 0, zOffset: 0, feedRate: 100, probeTravelDistance: 10 },
            scripts: { startup: '', toolChange: '', shutdown: '', jobPause: '', jobResume: '', jobStop: '' },
        };

        this.serialService = new SerialService({
            onData: this.processIncomingData.bind(this),
            onError: (error) => this.emitter.emit('error', error),
        });
    }

    async connect(options: ConnectionOptions): Promise<void> {
        if (this.serialService.isConnected || this.isConnecting) {
            throw new Error("A connection is already active or in progress.");
        }

        this.isConnecting = true;
        try {
            let portInfo: PortInfo;
            if (options.type === 'simulator') {
                const simulator = new LinuxCNCSimulator();
                portInfo = await this.serialService.connectSimulator(simulator);
            } else {
                // LinuxCNC typically uses TCP connection
                portInfo = await this.serialService.connect(options);
            }

            // Reset state
            this.lastStatus = {
                status: 'Idle',
                code: null,
                wpos: { x: 0, y: 0, z: 0 },
                mpos: { x: 0, y: 0, z: 0 },
                wco: { x: 0, y: 0, z: 0 },
                spindle: { state: 'off', speed: 0 },
                ov: [100, 100, 100],
            };

            // Wait for connection to stabilize
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Send hello command (simplified protocol)
            try {
                await this.sendCommand('hello EMC user-typing-at-keyboard 1.0');
            } catch (error) {
                console.warn('Could not send LinuxCNC hello:', error);
            }

            this.isConnecting = false;
            this.emitter.emit('state', { type: 'connect', data: portInfo });

            // Start status polling
            this.statusInterval = window.setInterval(() => this.requestStatusUpdate(), 500);

        } catch (error) {
            this.isConnecting = false;
            if (this.serialService.isConnected) {
                await this.disconnect();
            }
            throw error;
        }
    }

    disconnect(): void {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }

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
            this.emitter.emit('state', { type: 'disconnect' });
        }
    }

    private processIncomingData(line: string) {
        const trimmed = line.trim();
        if (!trimmed) return;

        // LinuxCNC remote shell responses
        // Simplified parsing - real LinuxCNC would need full protocol parser

        if (trimmed.startsWith('HELLO ACK')) {
            // Connection acknowledged
            this.emitter.emit('data', { type: 'received', message: trimmed });
        } else if (trimmed.startsWith('ERROR')) {
            if (this.linePromiseReject) {
                this.linePromiseReject(new Error(trimmed));
                this.linePromiseResolve = null;
                this.linePromiseReject = null;
            } else {
                this.emitter.emit('error', `LinuxCNC Error: ${trimmed}`);
            }
        } else if (trimmed === 'OK' || trimmed.startsWith('OK')) {
            if (this.linePromiseResolve) {
                this.linePromiseResolve();
                this.linePromiseResolve = null;
                this.linePromiseReject = null;
            }
            this.emitter.emit('data', { type: 'received', message: trimmed });
        } else if (trimmed.startsWith('STAT ')) {
            // Status response - parse it
            this.parseStatusResponse(trimmed);
        } else {
            // Other responses
            this.emitter.emit('data', { type: 'received', message: trimmed });
        }
    }

    private parseStatusResponse(line: string) {
        // Simplified status parsing
        // Real LinuxCNC would return structured status data
        // Format example: "STAT x:10.0 y:20.0 z:5.0 state:INTERP_IDLE"

        const xMatch = line.match(/x:([+-]?\d+\.?\d*)/);
        const yMatch = line.match(/y:([+-]?\d+\.?\d*)/);
        const zMatch = line.match(/z:([+-]?\d+\.?\d*)/);
        const stateMatch = line.match(/state:(\w+)/);

        if (xMatch) this.lastStatus.mpos.x = parseFloat(xMatch[1]);
        if (yMatch) this.lastStatus.mpos.y = parseFloat(yMatch[1]);
        if (zMatch) this.lastStatus.mpos.z = parseFloat(zMatch[1]);

        // Map LinuxCNC states to our states
        if (stateMatch) {
            const stateName = stateMatch[1];
            if (stateName.includes('IDLE')) this.lastStatus.status = 'Idle';
            else if (stateName.includes('RUN')) this.lastStatus.status = 'Run';
            else if (stateName.includes('PAUSED')) this.lastStatus.status = 'Hold';
            else this.lastStatus.status = 'Idle';
        }

        // Update work position (assuming no offset for now)
        this.lastStatus.wpos = { ...this.lastStatus.mpos };

        this.emitter.emit('state', { type: 'state', data: this.lastStatus });
    }

    async sendCommand(command: string, timeout = 10000): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (this.linePromiseResolve) {
                return reject(new Error("Cannot send new command while another is awaiting response."));
            }

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

            // For MDI commands, prefix with 'set mdi'
            const mdiCommand = command.startsWith('set ') ? command : `set mdi ${command}`;
            this.serialService.send(mdiCommand + '\n').catch(err => {
                this.linePromiseReject?.(err);
            });
        });
    }

    sendRealtimeCommand(command: string): void {
        // LinuxCNC doesn't use realtime commands in the same way
        // For abort, we'd use 'set abort'
        if (command === '\x18') {
            this.serialService.send('set abort\n').catch(console.error);
        }
    }

    private requestStatusUpdate() {
        // Request status
        if (!this.linePromiseResolve) {
            this.serialService.send('get state\n').catch(console.error);
        }
    }

    jog(x: number, y: number, z: number, feedRate: number): void {
        // LinuxCNC jogging
        // Use incremental mode for jogging
        const commands = [
            'set mode auto',
            'set auto',
            `G91 G0 X${x} Y${y} Z${z} F${feedRate}`,
            'G90'
        ];

        commands.forEach(cmd => {
            this.sendCommand(cmd).catch(err => {
                console.error('Jog command failed:', err);
            });
        });
    }

    home(axis: 'all' | 'x' | 'y' | 'z'): void {
        // LinuxCNC homing
        let command = 'set home -1'; // Home all axes
        if (axis !== 'all') {
            const axisNum = { x: 0, y: 1, z: 2 }[axis];
            command = `set home ${axisNum}`;
        }
        this.sendCommand(command).catch(err => {
            console.error('Home command failed:', err);
        });
    }

    emergencyStop(): void {
        this.stopJob();
        this.sendRealtimeCommand('\x18'); // Sends 'set abort'
    }

    async sendGCode(lines: string[], options: { startLine?: number; isDryRun?: boolean } = {}) {
        if (this.isJobRunning) return;
        this.isJobRunning = true;
        this.isPaused = false;
        this.jobAbortController = new AbortController();
        const { signal } = this.jobAbortController;

        const startLine = options.startLine || 0;
        this.lastStatus.status = 'Run';

        // Put LinuxCNC into auto mode
        await this.sendCommand('set mode auto');

        for (let i = startLine; i < lines.length; i++) {
            if (signal.aborted) break;

            while (this.isPaused) {
                if (signal.aborted) break;
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            if (signal.aborted) break;

            const line = lines[i];

            try {
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
        this.lastStatus.status = 'Idle';
        this.jobAbortController = null;
        this.emitter.emit('job', { status: 'complete' });
    }

    async pause() {
        if (this.isJobRunning && !this.isPaused) {
            this.isPaused = true;
            this.lastStatus.status = 'Hold';
            await this.sendCommand('set pause');
        }
    }

    async resume() {
        if (this.isJobRunning && this.isPaused) {
            this.isPaused = false;
            this.lastStatus.status = 'Run';
            await this.sendCommand('set resume');
        }
    }

    stopJob() {
        if (this.isJobRunning) {
            this.jobAbortController?.abort();
            this.isJobRunning = false;
            this.isPaused = false;
            this.lastStatus.status = 'Idle';
            this.serialService.send('set abort\n').catch(console.error);
        }
    }

    on(event: 'data' | 'state' | 'error', listener: (data: any) => void): void {
        this.emitter.on(event, listener);
    }

    off(event: 'data' | 'state' | 'error', listener: (data: any) => void): void {
        this.emitter.off(event, listener);
    }
}
