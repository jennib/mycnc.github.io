import { MachineState, ConnectionOptions } from "@mycnc/shared";

export interface Controller {
    connect(options: ConnectionOptions): Promise<void>;
    disconnect(): void;
    sendCommand(command: string, timeout?: number): Promise<string>;
    sendRealtimeCommand(command: string): void;
    jog(x: number, y: number, z: number, feedRate: number): void;
    home(axis: 'all' | 'x' | 'y' | 'z'): void;
    emergencyStop(): void;
    sendGCode(lines: string[], options?: { startLine?: number; isDryRun?: boolean }): void;
    pause(): Promise<void>;
    resume(): Promise<void>;
    stopJob(): void;
    on(event: 'data' | 'state' | 'error' | 'progress' | 'job', listener: (data: any) => void): void;
    off(event: 'data' | 'state' | 'error' | 'progress' | 'job', listener: (data: any) => void): void;
}
