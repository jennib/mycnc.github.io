export interface Simulator {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    write(data: string): Promise<void>;
    on(event: 'data', listener: (data: string) => void): void;
    off(event: 'data', listener: (data: string) => void): void;
}
