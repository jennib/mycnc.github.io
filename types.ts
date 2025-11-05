export enum JobStatus {
    Idle = 'idle',
    Running = 'running',
    Paused = 'paused',
    Stopped = 'stopped',
    Complete = 'complete',
}

export interface MachineState {
    status: 'Idle' | 'Run' | 'Hold' | 'Jog' | 'Alarm' | 'Door' | 'Check' | 'Home' | 'Sleep' | 'Connecting' | string;
    code: number | null;
    wpos: {
        x: number;
        y: number;
        z: number;
    };
    mpos: {
        x: number;
        y: number;
        z: number;
    };
    spindle: {
        state: 'off' | 'cw' | 'ccw';
        speed: number;
    };
    ov: number[];
}

export interface Log {
    type: 'sent' | 'received' | 'status' | 'error';
    message: string;
    timestamp: Date;
}

export interface Tool {
    id: number;
    name: string;
    diameter: number;
    type?: 'endmill' | 'v-bit' | string;
    angle?: number;
    length?: number;
}

export interface MachineSettings {
    workArea: { x: number; y: number; z: number };
    spindle: { min: number; max: number };
    probe: { xOffset: number; yOffset: number; zOffset: number; feedRate: number };
    scripts: { startup: string; toolChange: string; shutdown: string };
    isConfigured?: boolean;
}

export interface Macro {
    name: string;
    commands: string[];
}