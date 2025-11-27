import { MachineState, ConnectionOptions, MachineSettings, PortInfo } from '../types';
import { Controller } from './Controller';
import { SerialService } from '../services/serialService';
import { EventEmitter } from '../utils/EventEmitter';
import { TinyGSimulator } from '../services/simulators/TinyGSimulator';



/**
 * TinyG Controller
 * 
 * TinyG uses a JSON-based protocol for commands and responses.
 * Command format: {"gc":"G0 X10"} or {"x":null} for queries
 * Response format: {"r":{"x":10.000},"f":[1,0,6]}
 * Status reports are automatic JSON objects: {"sr":{"stat":3,"posx":0.000,...}}
 */
export class TinyGController implements Controller {
    private emitter = new EventEmitter<'data' | 'state' | 'error' | 'progress' | 'job'>();
    private serialService: SerialService;
    private settings: MachineSettings;

    private isConnecting = false;
    private commandQueue: Array<{ resolve: (value: any) => void, reject: (reason?: any) => void }> = [];

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
    private jsonBuffer: string = '';

    constructor(settings?: MachineSettings) {
        this.settings = settings || {
            controllerType: 'tinyg',
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
                const simulator = new TinyGSimulator();
                portInfo = await this.serialService.connectSimulator(simulator);
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

            // Request firmware version
            try {
                await this.sendJSONCommand({ fv: null });
            } catch (error) {
                console.warn('Could not get TinyG firmware info:', error);
            }

            this.isConnecting = false;
            this.emitter.emit('state', { type: 'connect', data: portInfo });

            // TinyG sends automatic status reports, but we can also poll
            this.statusInterval = window.setInterval(() => this.requestStatusUpdate(), 250);

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

        // Reject all pending commands
        this.commandQueue.forEach(cmd => cmd.reject(new Error('Connection disconnected')));
        this.commandQueue = [];

        try {
            this.serialService.disconnect();
        } catch (error) {
            console.error("Error during disconnect:", error);
        } finally {
            this.emitter.emit('state', { type: 'disconnect' });
        }
    }

    private processIncomingData(line: string) {
        // TinyG sends JSON, buffer until we have complete JSON
        this.jsonBuffer += line;

        // Try to parse JSON
        try {
            const json = JSON.parse(this.jsonBuffer);
            this.jsonBuffer = ''; // Clear buffer on success

            this.handleJSONResponse(json);
        } catch (e) {
            // Not complete JSON yet, keep buffering
            // But if buffer gets too large, clear it
            if (this.jsonBuffer.length > 10000) {
                console.warn('JSON buffer too large, clearing');
                this.jsonBuffer = '';
            }
        }
    }

    private handleJSONResponse(json: any) {
        // TinyG response format: {"r":{...},"f":[1,0,6]}
        // Status report: {"sr":{"stat":3,"posx":0.000,...}}

        if (json.r !== undefined) {
            // Command response
            const response = json.r;
            const footer = json.f; // [status_code, line_number, checksum]

            if (this.commandQueue.length > 0) {
                const cmd = this.commandQueue.shift()!;
                if (footer[0] === 0) {
                    cmd.resolve(response);
                } else {
                    cmd.reject(new Error(`TinyG error ${footer[0]}`));
                }
            }

            this.emitter.emit('data', { type: 'received', message: JSON.stringify(response) });
        }

        if (json.sr !== undefined) {
            // Status report
            this.parseStatusReport(json.sr);
        }
    }

    private parseStatusReport(sr: any) {
        // TinyG status codes: 0=init, 1=ready, 2=alarm, 3=stop, 4=end, 5=run, 6=hold, 9=homing
        const statMap: { [key: number]: MachineState['status'] } = {
            0: 'Idle',  // init
            1: 'Idle',  // ready
            2: 'Alarm', // alarm
            3: 'Idle',  // stop
            4: 'Idle',  // end
            5: 'Run',   // run
            6: 'Hold',  // hold
            9: 'Home',  // homing
        };

        if (sr.stat !== undefined) {
            this.lastStatus.status = statMap[sr.stat] || 'Idle';
        }

        // Position: posx, posy, posz are work coordinates
        if (sr.posx !== undefined) this.lastStatus.wpos.x = sr.posx;
        if (sr.posy !== undefined) this.lastStatus.wpos.y = sr.posy;
        if (sr.posz !== undefined) this.lastStatus.wpos.z = sr.posz;

        // Machine position: mpox, mpoy, mpoz
        if (sr.mpox !== undefined) this.lastStatus.mpos.x = sr.mpox;
        if (sr.mpoy !== undefined) this.lastStatus.mpos.y = sr.mpoy;
        if (sr.mpoz !== undefined) this.lastStatus.mpos.z = sr.mpoz;

        // Calculate WCO if we have both
        this.lastStatus.wco.x = this.lastStatus.mpos.x - this.lastStatus.wpos.x;
        this.lastStatus.wco.y = this.lastStatus.mpos.y - this.lastStatus.wpos.y;
        this.lastStatus.wco.z = this.lastStatus.mpos.z - this.lastStatus.wpos.z;

        this.emitter.emit('state', { type: 'state', data: this.lastStatus });
    }

    private async sendJSONCommand(cmd: any, timeout = 10000): Promise<any> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                const index = this.commandQueue.findIndex(c => c.resolve === resolve);
                if (index >= 0) this.commandQueue.splice(index, 1);
                reject(new Error(`Command timed out: ${JSON.stringify(cmd)}`));
            }, timeout);

            const wrappedResolve = (value: any) => {
                clearTimeout(timeoutId);
                resolve(value);
            };

            const wrappedReject = (reason: any) => {
                clearTimeout(timeoutId);
                reject(reason);
            };

            this.commandQueue.push({ resolve: wrappedResolve, reject: wrappedReject });
            this.serialService.send(JSON.stringify(cmd) + '\n').catch(wrappedReject);
        });
    }

    async sendCommand(command: string, timeout = 10000): Promise<string> {
        // Wrap G-code in JSON
        const response = await this.sendJSONCommand({ gc: command }, timeout);
        return 'ok';
    }

    sendRealtimeCommand(command: string): void {
        // TinyG supports some realtime commands
        // ! = feedhold, ~ = cycle start, ^x = reset
        this.serialService.send(command).catch(console.error);
    }

    private requestStatusUpdate() {
        // Request status report
        this.sendJSONCommand({ sr: null }).catch(err => {
            console.warn('Failed to get status:', err);
        });
    }

    jog(x: number, y: number, z: number, feedRate: number): void {
        // TinyG jogging - send as G-code
        const command = `G91 G0 X${x} Y${y} Z${z} F${feedRate} G90`;
        this.sendCommand(command).catch(err => {
            console.error('Jog command failed:', err);
        });
    }

    home(axis: 'all' | 'x' | 'y' | 'z'): void {
        // TinyG homing
        let command = 'G28.2 X0 Y0 Z0'; // Home all
        if (axis !== 'all') {
            command = `G28.2 ${axis.toUpperCase()}0`;
        }
        this.sendCommand(command).catch(err => {
            console.error('Home command failed:', err);
        });
    }

    emergencyStop(): void {
        this.stopJob();
        // Send ^x for reset
        this.sendRealtimeCommand('\x18');
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
            this.sendRealtimeCommand('!'); // Feed hold
        }
    }

    async resume() {
        if (this.isJobRunning && this.isPaused) {
            this.isPaused = false;
            this.lastStatus.status = 'Run';
            this.sendRealtimeCommand('~'); // Cycle start
        }
    }

    stopJob() {
        if (this.isJobRunning) {
            this.jobAbortController?.abort();
            this.isJobRunning = false;
            this.isPaused = false;
            this.lastStatus.status = 'Idle';
            this.sendRealtimeCommand('\x18'); // Reset
        }
    }

    on(event: 'data' | 'state' | 'error', listener: (data: any) => void): void {
        this.emitter.on(event, listener);
    }

    off(event: 'data' | 'state' | 'error', listener: (data: any) => void): void {
        this.emitter.off(event, listener);
    }
}
