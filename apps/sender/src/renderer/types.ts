export enum JobStatus {
    Idle = 'idle',
    Running = 'running',
    Paused = 'paused',
    Stopped = 'stopped',
    Complete = 'complete',
}

export interface ConsoleLog {
    type: 'sent' | 'received' | 'status' | 'error' | 'info';
    message: string;
    timestamp?: Date;
}

export interface MachinePosition {
    x: number;
    y: number;
    z: number;
}

export interface PortInfo {
    portName?: string;
    manufacturer?: string;
    type: 'usb' | 'tcp' | 'simulator';
    ip?: string;
    port?: number;
    usbVendorId?: number;
    usbProductId?: number;
}

export interface ConnectionOptions {
    type: 'usb' | 'tcp' | 'simulator';
    ip?: string;
    port?: number;
    baudRate?: number;
}

export interface MachineState {
    status: 'Idle' | 'Run' | 'Hold' | 'Jog' | 'Alarm' | 'Door' | 'Check' | 'Home' | 'Sleep';
    code?: number;
    wpos: MachinePosition;
    mpos: MachinePosition;
    wco: MachinePosition; // Added wco
    wcs: string; // Added wcs (e.g., G54)
    spindle: { state: 'cw' | 'ccw' | 'off'; speed: number }; // Changed to 'cw' | 'ccw' | 'off'
    ov: number[];
}

export interface Tool {
    id: number;
    name: string;
    diameter: number | '';
}

export interface Macro {
    name: string;
    description?: string;
    commands: string[];
}

export interface MachineSettings {
    controllerType: string;
    workArea: { x: number; y: number; z: number };
    jogFeedRate: number;
    spindle: { min: number; max: number; warmupDelay: number; };
    probe: { xOffset: number; yOffset: number; zOffset: number; feedRate: number; probeTravelDistance: number };
    scripts: { startup: string; toolChange: string; shutdown: string; jobPause: string; jobResume: string; jobStop: string; };
    isConfigured?: boolean;
}



export interface SurfacingParams {
    width: number | string;
    length: number | string;
    depth: number | string;
    stepover: number | string;
    feed: number | string;
    spindle: number | string;
    safeZ: number | string;
    startX: number | string;
    startY: number | string;
    toolId: number | null;
    direction: 'horizontal' | 'vertical';

}

export interface DrillingParams {
    drillType: 'single' | 'rect' | 'circ';
    depth: number | string;
    peck: number | string;
    retract: number | string;
    feed: number | string;
    spindle: number | string;
    safeZ: number | string;
    singleX: number | string;
    singleY: number | string;
    rectCols: number | string;
    rectRows: number | string;
    rectSpacingX: number | string;
    rectSpacingY: number | string;
    rectStartX: number | string;
    rectStartY: number | string;
    circCenterX: number | string;
    circCenterY: number | string;
    circRadius: number | string;
    circHoles: number | string;
    circStartAngle: number | string;

    toolId: number | null;
}

export interface BoreParams {
    centerX: number | string;
    centerY: number | string;
    holeDiameter: number | string;
    holeDepth: number | string;
    counterboreEnabled: boolean;
    cbDiameter: number | string;
    cbDepth: number | string;
    depthPerPass: number | string;
    feed: number | string;
    plungeFeed: number | string;
    spindle: number | string;
    safeZ: number | string;

    stepover: number | string;
    toolId: number | null;
}

export interface PocketParams {
    shape: 'rect' | 'circ';
    width: number | string;
    length: number | string;
    cornerRadius: number | string;
    diameter: number | string;
    depth: number | string;
    depthPerPass: number | string;
    stepover: number | string;
    feed: number | string;
    plungeFeed: number | string;
    spindle: number | string;
    safeZ: number | string;

    toolId: number | null;
}

export interface ProfileParams {
    shape: 'rect' | 'circ';
    width: number | string;
    length: number | string;
    cornerRadius: number | string;
    diameter: number | string;
    depth: number | string;
    depthPerPass: number | string;
    cutSide: 'outside' | 'inside' | 'online';
    tabsEnabled: boolean;
    numTabs: number | string;
    tabWidth: number | string;
    tabHeight: number | string;
    feed: number | string;
    spindle: number | string;
    safeZ: number | string;

    toolId: number | null;
}

export interface SlotParams {
    type: 'straight' | 'arc';
    slotWidth: number | string;
    depth: number | string;
    depthPerPass: number | string;
    feed: number | string;
    spindle: number | string;
    safeZ: number | string;
    startX: number | string;
    startY: number | string;
    endX: number | string;
    endY: number | string;
    centerX: number | string;
    centerY: number | string;
    radius: number | string;
    startAngle: number | string;
    endAngle: number | string;

    toolId: number | null;
}

export interface TextParams {
    text: string;
    font: string;
    height: number | string;
    spacing: number | string;
    startX: number | string;
    startY: number | string;
    alignment: 'left' | 'center' | 'right';
    depth: number | string;
    feed: number | string;
    spindle: number | string;
    safeZ: number | string;

    toolId: number | null;
}

export interface ThreadMillingParams {
    type: 'internal' | 'external';
    hand: 'right' | 'left';
    diameter: number | string;
    pitch: number | string;
    depth: number | string;
    feed: number | string;
    spindle: number | string;
    safeZ: number | string;

    toolId: number | null;
}

export interface ReliefParams {
    // Image
    imageDataUrl: string | null;
    invert: boolean; // If true, dark is high, light is low. Default (false): white is high, black is low.

    // Dimensions
    width: number | string;
    length: number | string;
    maxDepth: number | string; // Maximum depth of the relief (Z range)
    zSafe: number | string;

    // Roughing
    roughingEnabled: boolean;
    roughingToolId: number | null;
    roughingStepdown: number | string;
    roughingStepover: number | string; // % of tool diameter
    roughingStockToLeave: number | string;
    roughingFeed: number | string;
    roughingSpindle: number | string;

    // Finishing
    finishingEnabled: boolean;
    finishingToolId: number | null;
    finishingStepover: number | string; // % of tool diameter
    finishingAngle: number | string; // Raster angle (0 = X, 90 = Y)
    finishingFeed: number | string;
    finishingSpindle: number | string;

    // Operation Mode
    operation: 'both' | 'roughing' | 'finishing';
    keepAspectRatio: boolean;
    gamma: number;
    contrast: number;
    smoothing: number;
    detail: number; // Unsharp mask amount
    quality: 'low' | 'medium' | 'high';

    // Color Adjustments
    colorAdjustmentEnabled: boolean;

    // More (High Gain)
    adjustColorHigh: string;
    adjustAmountHigh: number;
    adjustToleranceHigh: number;

    // Less (Low Gain)
    adjustColorLow: string;
    adjustAmountLow: number;
    adjustToleranceLow: number;

    cutoutToolId?: number | null;
    cutoutDepth?: number | string;
    cutoutDepthPerPass?: number | string;
    cutoutStepIn?: number | string;
    cutoutXYPasses?: number | string;
    cutoutTabsEnabled?: boolean;
    cutoutTabWidth?: number | string;
    cutoutTabHeight?: number | string;
    cutoutTabCount?: number | string;
}

export interface STLParams {
    file: File | null;
    fileName: string;
    width: number | string;
    length: number | string;
    depth: number | string;
    zSafe: number | string;
    margin: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
    toolId: number | null;
    stepover: number | string;
    feedRate: number | string;
    spindleSpeed: number | string;
    roughingEnabled: boolean;
    roughingToolId: number | null;
    roughingStepdown: number | string;
    roughingStepover: number | string;
    roughingStockToLeave: number | string;
    roughingFeed: number | string;
    roughingSpindle: number | string;
    cutoutEnabled: boolean;
    cutoutToolId: number | null;
    cutoutDepth: number | string;
    cutoutDepthPerPass: number | string;
    cutoutStepIn: number | string;
    cutoutXYPasses: number | string;
    cutoutTabsEnabled: boolean;
    cutoutTabWidth: number | string;
    cutoutTabHeight: number | string;
    cutoutTabCount: number | string;
}

export interface GeneratorSettings {
    surfacing: SurfacingParams;
    drilling: DrillingParams;
    bore: BoreParams;
    pocket: PocketParams;
    profile: ProfileParams;
    slot: SlotParams;
    text: TextParams;
    thread: ThreadMillingParams;
    relief: ReliefParams;
    stl: STLParams;
}

export interface TimeEstimate {
    totalTime: number;
    remainingTime: number;
}

export interface WebcamSettings {
    selectedDeviceId: string;
    selectedAudioDeviceId: string;
    volume: number;
    isMuted: boolean;
    mode: 'off' | 'local' | 'webrtc';
    webRTCAutoConnect?: boolean;
}

