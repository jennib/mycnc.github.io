import { Simulator } from './Simulator';
import { PortInfo } from '@/types';

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
export class MarlinSimulator implements Simulator {
    private dataCallback: ((data: string) => void) | null = null;
    private connected = false;
    private position = { x: 0, y: 0, z: 0, e: 0 };
    private statusInterval: number | null = null;

    async connect(): Promise<PortInfo> {
        this.connected = true;

        // Send Marlin startup messages
        setTimeout(() => {
            this.sendData('echo: Marlin');
            this.sendData('echo: start');
            this.sendData('echo: Last Updated: Jan  1 2024 12:00:00 | Author: (Simulator)');
            this.sendData('Compiled: Jan  1 2024');
            this.sendData('echo: Free Memory: 4095');
            this.sendData('ok');
        }, 100);

        // Start periodic M105 temperature reports (typical in Marlin)
        this.statusInterval = window.setInterval(() => {
            if (this.connected) {
                this.sendData('ok T:25.0 /0.0 B:25.0 /0.0 @:0 B@:0');
            }
        }, 1000);

        return {
            type: 'simulator',
            portName: 'Marlin Simulator'
        };
    }

    async disconnect(): Promise<void> {
        this.connected = false;
        if (this.statusInterval !== null) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }
    }

    async sendCommand(command: string): Promise<void> {
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

            setTimeout(() => this.sendData('ok'), 50);
        } else if (trimmed === 'M114') {
            // Position report
            setTimeout(() => {
                this.sendData(`X:${this.position.x.toFixed(2)} Y:${this.position.y.toFixed(2)} Z:${this.position.z.toFixed(2)} E:${this.position.e.toFixed(2)} Count X:0 Y:0 Z:0`);
                this.sendData('ok');
            }, 50);
        } else if (trimmed === 'M105') {
            // Temperature report
            setTimeout(() => {
                this.sendData('ok T:25.0 /0.0 B:25.0 /0.0 @:0 B@:0');
            }, 50);
        } else if (trimmed === 'G28') {
            // Home all axes
            this.position = { x: 0, y: 0, z: 0, e: 0 };
            setTimeout(() => this.sendData('ok'), 200);
        } else if (trimmed.startsWith('M112')) {
            // Emergency stop
            setTimeout(() => this.sendData('ok'), 10);
        } else {
            // Generic ok for other commands
            setTimeout(() => this.sendData('ok'), 50);
        }
    }

    onData(callback: (data: string) => void): void {
        this.dataCallback = callback;
    }

    private sendData(data: string): void {
        if (this.dataCallback && this.connected) {
            this.dataCallback(data);
        }
    }
}
