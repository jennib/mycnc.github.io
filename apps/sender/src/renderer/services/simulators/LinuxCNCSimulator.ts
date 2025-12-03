import { Simulator } from './Simulator';

/**
 * LinuxCNC Simulator
 * 
 * Simulates LinuxCNC responses for testing without hardware.
 * This is a simplified implementation using a basic remote shell protocol.
 * 
 * Note: Real LinuxCNC uses complex protocols (HAL, NML, etc.)
 * This simulator provides basic MDI (Manual Data Input) functionality.
 */

type Listener = (data: string) => void;

export class LinuxCNCSimulator implements Simulator {
    private listeners: { [event: string]: Listener[] } = {};
    private connected = false;
    private position = { x: 0, y: 0, z: 0 };
    private statusInterval: number | null = null;
    private state = 'IDLE'; // IDLE, RUN, PAUSED, ESTOP

    async connect(): Promise<void> {
        this.connected = true;

        // Send LinuxCNC startup message
        setTimeout(() => {
            this.emitData('EMCNML Version 1.0\r\n');
            this.emitData('LinuxCNC Remote Interface\r\n');
            this.emitData('Ready\r\n');
        }, 100);

        // Start periodic status reports
        this.statusInterval = window.setInterval(() => {
            if (this.connected) {
                this.sendStatusReport();
            }
        }, 200); // LinuxCNC status updates
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

        const trimmed = command.trim().toUpperCase();

        // Handle LinuxCNC MDI commands
        if (trimmed.startsWith('G0') || trimmed.startsWith('G1')) {
            // Movement command
            const match = {
                x: /X([-\d.]+)/.exec(command),
                y: /Y([-\d.]+)/.exec(command),
                z: /Z([-\d.]+)/.exec(command)
            };

            if (match.x) this.position.x = parseFloat(match.x[1]);
            if (match.y) this.position.y = parseFloat(match.y[1]);
            if (match.z) this.position.z = parseFloat(match.z[1]);

            this.state = 'RUN';
            setTimeout(() => {
                this.state = 'IDLE';
                this.emitData('OK\r\n');
            }, 100);
        } else if (trimmed === 'G28') {
            // Home all axes
            this.position = { x: 0, y: 0, z: 0 };
            this.state = 'RUN';
            setTimeout(() => {
                this.state = 'IDLE';
                this.emitData('OK\r\n');
            }, 500);
        } else if (trimmed.startsWith('M3') || trimmed.startsWith('M4')) {
            // Spindle on
            setTimeout(() => this.emitData('OK\r\n'), 50);
        } else if (trimmed.startsWith('M5')) {
            // Spindle off
            setTimeout(() => this.emitData('OK\r\n'), 50);
        } else if (trimmed === 'STATUS') {
            // Status request
            this.sendStatusReport();
        } else if (trimmed === 'ESTOP') {
            // Emergency stop
            this.state = 'ESTOP';
            this.emitData('ESTOP ACTIVATED\r\n');
        } else if (trimmed === 'ESTOP_RESET') {
            // Reset emergency stop
            this.state = 'IDLE';
            this.emitData('ESTOP RESET\r\n');
        } else {
            // Generic response
            setTimeout(() => this.emitData('OK\r\n'), 50);
        }
    }

    private sendStatusReport(): void {
        // Simplified LinuxCNC status format
        const status = `STATE:${this.state} ` +
            `X:${this.position.x.toFixed(3)} ` +
            `Y:${this.position.y.toFixed(3)} ` +
            `Z:${this.position.z.toFixed(3)}\r\n`;
        this.emitData(status);
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
