import { MachineState, ConnectionOptions } from '../types';

export interface Controller {
    connect(options: ConnectionOptions): Promise<void>;
    disconnect(): void;
    sendCommand(command: string): Promise<string>;
    sendRealtimeCommand(command: string): void;
    jog(x: number, y: number, z: number, feedRate: number): void;
    home(axis: 'all' | 'x' | 'y' | 'z'): void;
    emergencyStop(): void;
    on(event: 'data' | 'state' | 'error', listener: (data: any) => void): void;
    off(event: 'data' | 'state' | 'error', listener: (data: any) => void): void;
}
