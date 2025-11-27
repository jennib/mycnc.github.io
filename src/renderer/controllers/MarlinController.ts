import { MachineState, ConnectionOptions } from '../types';
import { Controller } from './Controller';

export class MarlinController implements Controller {
    async connect(options: ConnectionOptions): Promise<void> {
        throw new Error('Marlin controller not implemented yet.');
    }

    disconnect(): void {
        throw new Error('Marlin controller not implemented yet.');
    }

    async sendCommand(command: string): Promise<string> {
        throw new Error('Marlin controller not implemented yet.');
    }

    sendRealtimeCommand(command: string): void {
        throw new Error('Marlin controller not implemented yet.');
    }

    jog(x: number, y: number, z: number, feedRate: number): void {
        throw new Error('Marlin controller not implemented yet.');
    }

    home(axis: 'all' | 'x' | 'y' | 'z'): void {
        throw new Error('Marlin controller not implemented yet.');
    }

    emergencyStop(): void {
        throw new Error('Marlin controller not implemented yet.');
    }

    on(event: 'data' | 'state' | 'error', listener: (data: any) => void): void {
        // Not implemented
    }

    off(event: 'data' | 'state' | 'error', listener: (data: any) => void): void {
        // Not implemented
    }
}
