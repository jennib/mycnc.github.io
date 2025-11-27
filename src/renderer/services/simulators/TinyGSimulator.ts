import { Simulator } from './Simulator';

/**
 * TinyG Firmware Simulator
 * 
 * Simulates TinyG JSON-based responses for testing without hardware.
 * TinyG uses a unique JSON protocol:
 * - Commands and responses in JSON format
 * - Status reports as JSON objects
 * - Automatic status reports with {"sr":{...}}
 */

type Listener = (data: string) => void;

export class TinyGSimulator implements Simulator {
    private listeners: { [event: string]: Listener[] } = {};
    private connected = false;
    private position = { x: 0, y: 0, z: 0, a: 0, b: 0, c: 0 };
    private statusInterval: number | null = null;
    private stat = 1; // 1 = stop, 3 = run, 4 = hold

    async connect(): Promise<void> {
        this.connected = true;

        // Send TinyG startup JSON
        setTimeout(() => {
            this.emitData(JSON.stringify({
                r: {
                    fv: 0.97,
                    fb: 440.20,
                    hp: 3,
                    id: "9H3583-KMB",
                    msg: "SYSTEM READY"
                }
            }) + '\n');
        }, 100);

        // Start periodic status reports
        this.statusInterval = window.setInterval(() => {
            if (this.connected) {
                this.sendStatusReport();
            }
        }, 250); // TinyG typically reports every 250ms
    }

    async disconnect(): Promise<void> {
        this.connected = false;
        if (this.statusInterval !== null) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }
    }

    async write(command: string): Promise<void> {
        if (!this.connected) return;

        let jsonCmd: any;

        // Try to parse as JSON, otherwise treat as G-code
        try {
            jsonCmd = JSON.parse(command.trim());
        } catch (e) {
            // Not JSON, treat as G-code
            this.handleGCode(command.trim());
            return;
        }

        // Handle JSON commands
        if (jsonCmd.gc) {
            // G-code wrapped in JSON
            this.handleGCode(jsonCmd.gc);
        } else if (jsonCmd.sr !== undefined) {
            // Status report request
            setTimeout(() => this.sendStatusReport(), 10);
        } else {
            // Config command - just acknowledge
            setTimeout(() => {
                this.emitData(JSON.stringify({
                    r: jsonCmd,
                    f: [1, 0, 0]  // status code [ok, status_code, line]
                }) + '\n');
            }, 50);
        }
    }

    private handleGCode(gcode: string): void {
        const trimmed = gcode.toUpperCase();

        if (trimmed.startsWith('G0') || trimmed.startsWith('G1')) {
            // Movement - update position
            const match = {
                x: /X([-\d.]+)/.exec(gcode),
                y: /Y([-\d.]+)/.exec(gcode),
                z: /Z([-\d.]+)/.exec(gcode),
                a: /A([-\d.]+)/.exec(gcode),
                b: /B([-\d.]+)/.exec(gcode),
                c: /C([-\d.]+)/.exec(gcode)
            };

            if (match.x) this.position.x = parseFloat(match.x[1]);
            if (match.y) this.position.y = parseFloat(match.y[1]);
            if (match.z) this.position.z = parseFloat(match.z[1]);
            if (match.a) this.position.a = parseFloat(match.a[1]);
            if (match.b) this.position.b = parseFloat(match.b[1]);
            if (match.c) this.position.c = parseFloat(match.c[1]);

            this.stat = 3; // Running
            setTimeout(() => {
                this.stat = 1; // Stop
                this.emitData(JSON.stringify({
                    r: {},
                    f: [1, 0, 0]
                }) + '\n');
            }, 100);
        } else if (trimmed === 'G28' || trimmed === 'G28.2') {
            // Homing
            this.position = { x: 0, y: 0, z: 0, a: 0, b: 0, c: 0 };
            setTimeout(() => {
                this.emitData(JSON.stringify({
                    r: {},
                    f: [1, 0, 0]
                }) + '\n');
            }, 200);
        } else {
            // Generic response
            setTimeout(() => {
                this.emitData(JSON.stringify({
                    r: {},
                    f: [1, 0, 0]
                }) + '\n');
            }, 50);
        }
    }

    private sendStatusReport(): void {
        this.emitData(JSON.stringify({
            sr: {
                stat: this.stat,
                posx: this.position.x,
                posy: this.position.y,
                posz: this.position.z,
                posa: this.position.a,
                posb: this.position.b,
                posc: this.position.c,
                vel: 0,
                feed: 0,
                unit: 1, // 0=inch, 1=mm
                coor: 1, // 0=G53, 1=G54, etc.
                dist: 0, // 0=absolute, 1=incremental
                frmo: 0  // 0=Off, 1=G93
            }
        }) + '\n');
    }

    on(event: 'data', listener: Listener): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }

    off(event: 'data', listener: Listener): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }

    private emitData(data: string): void {
        if (this.listeners['data'] && this.connected) {
            this.listeners['data'].forEach(listener => listener(data));
        }
    }
}
