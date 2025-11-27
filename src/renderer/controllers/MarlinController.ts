import { MachineState, ConnectionOptions, MachineSettings, PortInfo } from '../types';
import { Controller } from './Controller';
import { SerialService } from '../services/serialService';

type Listener = (data: any) => void;

class EventEmitter {
    private listeners: { [event: string]: Listener[] } = {};

    on(event: string, listener: Listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }

    off(event: string, listener: Listener) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }

    emit(event: string, data: any) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(listener => listener(data));
    }
}

/**
 * Marlin Controller
 * 
 * Marlin is a popular firmware for 3D printers and CNC machines.
 * Protocol differences from GRBL:
 * - No realtime commands (?, !, ~)
 * - Temperature control (M104, M109, M140, M190)
 * - Different position reporting (M114)
 * - Different status format
 * - Bed leveling (G29, M420)
 */
export class MarlinController implements Controller {
    private emitter = new EventEmitter();
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
            controllerType: 'marlin',
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
                // For now, we don't have a Marlin simulator
                // You could create MarlinSimulator similar to GrblSimulator
                throw new Error('Marlin simulator not implemented yet');
            } else {
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

            // Marlin doesn't have a welcome message like GRBL, but we can send M115 for version
            try {
                await this.sendCommand('M115'); // Get firmware info
            } catch (error) {
                console.warn('Could not get Marlin firmware info:', error);
            }

            this.isConnecting = false;
            this.emitter.emit('state', { type: 'connect', data: portInfo });

            // Start status polling (Marlin doesn't have realtime status like GRBL)
            this.statusInterval = window.setInterval(() => this.requestStatusUpdate(), 1000);

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

        // Marlin responses
        if (trimmed.startsWith('X:')) {
            // Position report from M114: "X:0.00 Y:0.00 Z:0.00 E:0.00 Count X:0 Y:0 Z:0"
            this.parsePositionReport(trimmed);
        } else if (trimmed === 'ok') {
            if (this.linePromiseResolve) {
                this.linePromiseResolve();
                this.linePromiseResolve = null;
                this.linePromiseReject = null;
            }
            this.emitter.emit('data', { type: 'received', message: trimmed });
        } else if (trimmed.startsWith('Error:') || trimmed.startsWith('!!')) {
            if (this.linePromiseReject) {
                this.linePromiseReject(new Error(trimmed));
                this.linePromiseResolve = null;
                this.linePromiseReject = null;
            } else {
                this.emitter.emit('error', `Marlin Error: ${trimmed}`);
            }
        } else {
            // Other responses (firmware info, temperature, etc.)
            this.emitter.emit('data', { type: 'received', message: trimmed });
        }
    }

    private parsePositionReport(line: string) {
        // Parse "X:10.00 Y:20.00 Z:5.00 E:0.00"
        const xMatch = line.match(/X:([+-]?\d+\.?\d*)/);
        const yMatch = line.match(/Y:([+-]?\d+\.?\d*)/);
        const zMatch = line.match(/Z:([+-]?\d+\.?\d*)/);

        if (xMatch) this.lastStatus.mpos.x = parseFloat(xMatch[1]);
        if (yMatch) this.lastStatus.mpos.y = parseFloat(yMatch[1]);
        if (zMatch) this.lastStatus.mpos.z = parseFloat(zMatch[1]);

        // Marlin typically reports machine position; work position would need WCO
        this.lastStatus.wpos.x = this.lastStatus.mpos.x - this.lastStatus.wco.x;
        this.lastStatus.wpos.y = this.lastStatus.mpos.y - this.lastStatus.wco.y;
        this.lastStatus.wpos.z = this.lastStatus.mpos.z - this.lastStatus.wco.z;

        this.emitter.emit('state', { type: 'state', data: this.lastStatus });
    }

    async sendCommand(command: string, timeout = 10000): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (this.linePromiseResolve) {
                return reject(new Error("Cannot send new command while another is awaiting 'ok'."));
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

            this.serialService.send(command + '\n').catch(err => {
                this.linePromiseReject?.(err);
            });
        });
    }

    sendRealtimeCommand(command: string): void {
        // Marlin doesn't support realtime commands like GRBL
        // For emergency stop, we'd need to send M112 as a regular command
        console.warn('Marlin does not support realtime commands');
    }

    private requestStatusUpdate() {
        // Request position report
        if (!this.linePromiseResolve) {
            this.sendCommand('M114').catch(err => {
                console.warn('Failed to get position:', err);
            });
        }
    }

    jog(x: number, y: number, z: number, feedRate: number): void {
        // Marlin jogging: G91 (relative), G0, G90 (back to absolute)
        const command = `G91\nG0 X${x} Y${y} Z${z} F${feedRate}\nG90`;
        this.sendCommand(command).catch(err => {
            console.error('Jog command failed:', err);
        });
    }

    home(axis: 'all' | 'x' | 'y' | 'z'): void {
        let command = 'G28'; // Home all
        if (axis !== 'all') {
            command = `G28 ${axis.toUpperCase()}0`; // Home specific axis
        }
        this.sendCommand(command).catch(err => {
            console.error('Home command failed:', err);
        });
    }

    emergencyStop(): void {
        this.stopJob();
        // M112 is emergency stop in Marlin
        this.serialService.send('M112\n').catch(console.error);
    }

    async sendGCode(lines: string[], options: { startLine?: number; isDryRun?: boolean } = {}) {
        if (this.isJobRunning) return;
        this.isJobRunning = true;
        this.isPaused = false;
        this.jobAbortController = new AbortController();
        const { signal } = this.jobAbortController;

        const startLine = options.startLine || 0;
        this.lastStatus.status = 'Run';

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
            // Marlin: Send M0 for pause
            await this.sendCommand('M0');
        }
    }

    async resume() {
        if (this.isJobRunning && this.isPaused) {
            this.isPaused = false;
            this.lastStatus.status = 'Run';
            // Marlin resumes automatically after M0 when you send next command
        }
    }

    stopJob() {
        if (this.isJobRunning) {
            this.jobAbortController?.abort();
            this.isJobRunning = false;
            this.isPaused = false;
            this.lastStatus.status = 'Idle';
            // Send M112 for emergency stop
            this.serialService.send('M112\n').catch(console.error);
        }
    }

    on(event: 'data' | 'state' | 'error', listener: (data: any) => void): void {
        this.emitter.on(event, listener);
    }

    off(event: 'data' | 'state' | 'error', listener: (data: any) => void): void {
        this.emitter.off(event, listener);
    }
}
