export enum JobStatus {
    Idle = 'idle',
    Running = 'running',
    Paused = 'paused',
    Stopped = 'stopped',
    Complete = 'complete',
}

export interface MachineState {
    status: 'Idle' | 'Run' | 'Hold' | 'Jog' | 'Alarm' | 'Door' | 'Check' | 'Home' | 'Sleep';
    code?: number;
    wpos: { x: number; y: number; z: number };
    mpos: { x: number; y: number; z: number };
    spindle: { state: 'on' | 'off'; speed: number };
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
}

export interface Macro {
    name: string;
    commands: string[];
}

export interface MachineSettings {
    workArea: { x: number; y: number; z: number };
    spindle: { min: number; max: number; defaultFeedRate?: number; defaultPlungeRate?: number; };
    probe: { xOffset: number; yOffset: number; zOffset: number; feedRate: number };
    scripts: { startup: string; toolChange: string; shutdown: string; jobPause: string; jobResume: string; jobStop: string; };
    isConfigured?: boolean;
}

export interface GeneratorSettings {
    surfacing: any;
    drilling: any;
    bore: any;
    pocket: any;
    profile: any;
    slot: any;
    text: any;
    thread: any;
}
