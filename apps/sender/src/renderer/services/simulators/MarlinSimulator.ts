import { Simulator } from './Simulator';

/**
 * Marlin Firmware Simulator
 * 
 * Simulates Marlin G-code responses for testing without hardware.
 * Marlin uses a different protocol than GRBL with:
 * - "ok" responses after each command
 * - Position reports (M114)
 * - Temperature reports (M105) 
 * - Different status messages
 */

type Listener = (data: string) => void;

export class MarlinSimulator implements Simulator {
    private listeners: { [event: string]: Listener[] } = {};
    private connected = false;
    private position = { x: 0, y: 0, z: 0, e: 0 };
    private statusInterval: number | null = null;

    async connect(): Promise<void> {
        this.connected = true;

        // Send Marlin startup messages
        setTimeout(() => {
            this.emitData('echo: Marlin\r\n');
            this.emitData('echo: start\r\n');
            this.emitData('echo: Last Updated: Jan  1 2024 12:00:00 | Author: (Simulator)\r\n');
            this.emitData('Compiled: Jan  1 2024\r\n');
            this.emitData('echo: Free Memory: 4095\r\n');
            this.emitData('ok\r\n');
        }, 100);

        // Start periodic M105 temperature reports (typical in Marlin)
        this.statusInterval = window.setInterval(() => {
            if (this.connected) {
                this.emitData('ok T:25.0 /0.0 B:25.0 /0.0 @:0 B@:0\r\n');
            }
        }, 1000);
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

        // Handle various Marlin commands
        if (trimmed.startsWith('G0') || trimmed.startsWith('G1')) {
            // Movement command - update simulated position
            const match = {
                x: /X([-\d.]+)/.exec(command),
                y: /Y([-\d.]+)/.exec(command),
                z: /Z([-\d.]+)/.exec(command),
                e: /E([-\d.]+)/.exec(command)
            };

            if (match.x) this.position.x = parseFloat(match.x[1]);
            if (match.y) this.position.y = parseFloat(match.y[1]);
            if (match.z) this.position.z = parseFloat(match.z[1]);
            if (match.e) this.position.e = parseFloat(match.e[1]);

            setTimeout(() => this.emitData('ok\r\n'), 50);
        } else if (trimmed === 'M114') {
            // Position report
            setTimeout(() => {
                this.emitData(`X:${this.position.x.toFixed(2)} Y:${this.position.y.toFixed(2)} Z:${this.position.z.toFixed(2)} E:${this.position.e.toFixed(2)} Count X:0 Y:0 Z:0\r\n`);
                this.emitData('ok\r\n');
            }, 50);
        } else if (trimmed === 'M105') {
            // Temperature report
            setTimeout(() => {
                this.emitData('ok T:25.0 /0.0 B:25.0 /0.0 @:0 B@:0\r\n');
            }, 50);
        } else if (trimmed === 'G28') {
            // Home all axes
            this.position = { x: 0, y: 0, z: 0, e: 0 };
            setTimeout(() => this.emitData('ok\r\n'), 200);
        } else if (trimmed.startsWith('M112')) {
            // Emergency stop
            setTimeout(() => this.emitData('ok\r\n'), 10);
        } else {
            // Generic ok for other commands
            setTimeout(() => this.emitData('ok\r\n'), 50);
        }
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
