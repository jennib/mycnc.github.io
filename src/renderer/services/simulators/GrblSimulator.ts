import { Simulator } from './Simulator';
import { MachineState } from '@/types';

// Helper to parse parameters from G-code commands
const getParam = (gcode: string, param: string): number | null => {
    const regex = new RegExp(`${param}\\s*([-+]?[0-9]*\\.?[0-9]*)`, 'i');
    const match = gcode.match(regex);
    return match ? parseFloat(match[1]) : null;
};

type Listener = (data: string) => void;

export class GrblSimulator implements Simulator {
    private listeners: { [event: string]: Listener[] } = {};
    private statusInterval: number | null = null;

    // Machine State
    private state: MachineState = {
        status: 'Idle',
        code: undefined,
        wpos: { x: 0, y: 0, z: 0 },
        mpos: { x: 0, y: 0, z: 0 },
        wco: { x: 0, y: 0, z: 0 },
        spindle: { state: 'off', speed: 0 },
        ov: [100, 100, 100],
    };

    private positioningMode: 'absolute' | 'incremental' = 'absolute';

    async connect(): Promise<void> {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Start status reporting interval
        this.statusInterval = window.setInterval(() => {
            this.emitStatus();
        }, 250);

        // Send welcome message
        setTimeout(() => {
            this.emitData("\r\nGrbl 1.1h ['$' for help]\r\n");
        }, 100);
    }

    async disconnect(): Promise<void> {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }
    }

    async write(data: string): Promise<void> {
        // Simulate processing delay
        // setTimeout(() => this.processCommand(data), 10);
        // Actually, we can process immediately but emit response with slight delay if needed.
        // But for 'write', we usually just fire and forget in the service.
        this.processCommand(data);
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

    private emitData(data: string) {
        if (this.listeners['data']) {
            this.listeners['data'].forEach(listener => listener(data));
        }
    }

    private emitStatus() {
        const s = this.state;
        // Format: <Idle|MPos:0.000,0.000,0.000|Bf:15,128|FS:0,0|WCO:0.000,0.000,0.000>
        // Note: GrblController expects specific format.
        // From SimulatedSerialService:
        // <Idle|MPos:0.000,0.000,0.000|WPos:0.000,0.000,0.000|FS:0,0|WCO:0.000,0.000,0.000>

        const mpos = `MPos:${s.mpos.x.toFixed(3)},${s.mpos.y.toFixed(3)},${s.mpos.z.toFixed(3)}`;
        const wpos = `WPos:${s.wpos.x.toFixed(3)},${s.wpos.y.toFixed(3)},${s.wpos.z.toFixed(3)}`;
        const fs = `FS:${s.spindle.state === 'off' ? 0 : s.spindle.speed},${s.spindle.speed}`; // Spindle speed, feed rate (using spindle speed for both for now?)
        // Actually FS is Feed, Spindle. 
        // SimulatedSerialService used: FS:${...},${...} which seems to be Spindle, Spindle?
        // Let's check SimulatedSerialService again.
        // FS:${newPosition.spindle.state === 'off' ? 0 : newPosition.spindle.speed},${newPosition.spindle.speed}
        // It seems it was putting spindle speed in both slots?
        // Standard GRBL is FS:Feed,Spindle.

        const wco = `WCO:${s.wco.x.toFixed(3)},${s.wco.y.toFixed(3)},${s.wco.z.toFixed(3)}`;

        const statusString = `<${s.status}|${mpos}|${wpos}|${fs}|${wco}>`;
        this.emitData(statusString + '\r\n');
    }

    private processCommand(rawCommand: string) {
        const command = rawCommand.trim();
        if (!command) return;

        // Realtime commands (single characters)
        if (command.length === 1) {
            this.processRealtimeCommand(command);
            return;
        }

        const upperCmd = command.toUpperCase();

        // Handle standard G-code/GRBL commands
        if (upperCmd === '$H') {
            // GRBL sends 'ok' immediately when it accepts the homing command
            this.emitData('ok\r\n');

            // Set status to Home and simulate homing sequence
            this.state.status = 'Home';
            setTimeout(() => {
                this.state.mpos = { x: 0, y: 0, z: 0 };
                this.updateWPos();
                this.state.status = 'Idle';
            }, 2000); // 2 second homing simulation
            return;
        }

        if (upperCmd === '$X') {
            if (this.state.status === 'Alarm') {
                this.state.status = 'Idle';
                this.state.code = undefined;
                this.emitData('[MSG:Caution: Unlocked]\r\n');
            }
            this.emitData('ok\r\n');
            return;
        }

        if (upperCmd.startsWith('$J=')) {
            // Jogging
            this.state.status = 'Jog';
            const x = getParam(upperCmd, 'X') || 0;
            const y = getParam(upperCmd, 'Y') || 0;
            const z = getParam(upperCmd, 'Z') || 0;

            // Simulate movement
            setTimeout(() => {
                this.state.mpos.x += x;
                this.state.mpos.y += y;
                this.state.mpos.z += z;
                this.updateWPos();
                this.state.status = 'Idle';
            }, 200);

            this.emitData('ok\r\n');
            return;
        }

        if (upperCmd.startsWith('G0') || upperCmd.startsWith('G1')) {
            const x = getParam(upperCmd, 'X');
            const y = getParam(upperCmd, 'Y');
            const z = getParam(upperCmd, 'Z');

            // Simulate movement time (e.g., 10ms)
            setTimeout(() => {
                if (this.positioningMode === 'incremental') {
                    if (x !== null) this.state.mpos.x += x;
                    if (y !== null) this.state.mpos.y += y;
                    if (z !== null) this.state.mpos.z += z;
                } else {
                    if (x !== null) this.state.mpos.x = x + this.state.wco.x;
                    if (y !== null) this.state.mpos.y = y + this.state.wco.y;
                    if (z !== null) this.state.mpos.z = z + this.state.wco.z;
                }
                this.updateWPos();
                this.emitData('ok\r\n');
            }, 10);
            return;
        }

        if (upperCmd === 'G90') {
            this.positioningMode = 'absolute';
            this.emitData('ok\r\n');
            return;
        }

        if (upperCmd === 'G91') {
            this.positioningMode = 'incremental';
            this.emitData('ok\r\n');
            return;
        }

        if (upperCmd.startsWith('G10 L20 P1')) {
            const x = getParam(upperCmd, 'X');
            const y = getParam(upperCmd, 'Y');
            const z = getParam(upperCmd, 'Z');

            if (x !== null) { this.state.wco.x = this.state.mpos.x - x; }
            if (y !== null) { this.state.wco.y = this.state.mpos.y - y; }
            if (z !== null) { this.state.wco.z = this.state.mpos.z - z; }
            this.updateWPos();
            this.emitData('ok\r\n');
            return;
        }

        if (upperCmd.startsWith('M3')) {
            const speed = getParam(upperCmd, 'S') || this.state.spindle.speed || 1000;
            this.state.spindle.state = 'cw';
            this.state.spindle.speed = speed;
            this.emitData('ok\r\n');
            return;
        }

        if (upperCmd.startsWith('M4')) {
            const speed = getParam(upperCmd, 'S') || this.state.spindle.speed || 1000;
            this.state.spindle.state = 'ccw';
            this.state.spindle.speed = speed;
            this.emitData('ok\r\n');
            return;
        }

        if (upperCmd.startsWith('M5')) {
            this.state.spindle.state = 'off';
            this.state.spindle.speed = 0;
            this.emitData('ok\r\n');
            return;
        }

        // Default response for unknown or unhandled commands
        this.emitData('ok\r\n');
    }

    private processRealtimeCommand(char: string) {
        switch (char) {
            case '?':
                // Status report requested. We already send it periodically, but we can send one now too.
                // this.emitStatus(); 
                // GrblController requests status with '?' periodically.
                // If we reply immediately, it might flood if the interval is also running?
                // But GrblController uses '?' to poll.
                // The Simulator's interval is simulating the *machine* pushing updates?
                // Actually, GRBL only sends status when '?' is received.
                // But `SimulatedSerialManager` had an interval that called `callbacks.onStatus`.
                // If I want to be accurate to GRBL, I should only reply to '?'.
                // However, `GrblController` sets up an interval to send '?'.
                // So if I reply to '?', it should work.
                // Let's remove the auto-interval if we are handling '?'.
                // But `SimulatedSerialManager` had an interval.
                // Let's keep the interval for now to be safe, or maybe the interval in `SimulatedSerialManager` was just to update the UI *because* it wasn't receiving '?' from a controller?
                // `GrblController` sends '?' every 100ms.
                // So I should probably reply to '?'.
                this.emitStatus();
                break;
            case '\x18': // Soft reset (Ctrl-X)
                this.state.status = 'Idle';
                this.state.mpos = { x: 0, y: 0, z: 0 }; // Reset position? No, soft reset doesn't lose position usually, but it stops motion.
                this.state.spindle.state = 'off';
                this.state.spindle.speed = 0;
                this.emitData("\r\nGrbl 1.1h ['$' for help]\r\n");
                break;
            // Feed overrides
            case '\x90': this.state.ov[0] = 100; break;
            case '\x91': this.state.ov[0] = Math.min(this.state.ov[0] + 10, 200); break;
            case '\x92': this.state.ov[0] = Math.max(this.state.ov[0] - 10, 10); break;
        }
    }

    private updateWPos() {
        this.state.wpos.x = this.state.mpos.x - this.state.wco.x;
        this.state.wpos.y = this.state.mpos.y - this.state.wco.y;
        this.state.wpos.z = this.state.mpos.z - this.state.wco.z;
    }
}
