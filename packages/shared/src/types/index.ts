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
    pins?: string;
}

export type ToolType = 'endmill' | 'ballmill' | 'bullhead' | 'vbit30' | 'vbit60' | 'vbit90' | 'surfacing' | 'cornmill';
export type CutDirection = 'up' | 'down' | 'compression';

export interface Tool {
    id: number;
    name: string;
    diameter: number | '';
    type: ToolType;
    flutes: number | '';
    cutDirection: CutDirection;
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
    probe: { xOffset: number; yOffset: number; zOffset: number; fastFeedRate: number; slowFeedRate: number; probeTravelDistance: number; retractDistance: number; blockWidthX: number; blockWidthY: number; blockHeight: number; bitDiameter: number };
    scripts: { startup: string; toolChange: string; shutdown: string; jobPause: string; jobResume: string; jobStop: string; };
    toolChangePolicy?: 'native' | 'macro';
    toolChangeMacroId?: string | null;
    isConfigured?: boolean;
    playCompletionSound?: boolean;
    isVirtualKeyboardEnabled?: boolean;
}



export interface SurfacingParams {
    width: number | '';
    length: number | '';
    depth: number | '';
    stepover: number | '';
    feed: number | '';
    spindle: number | '';
    safeZ: number | '';
    startX: number | '';
    startY: number | '';
    toolId: number | null;
    direction: 'horizontal' | 'vertical';

}

export interface DrillingParams {
    drillType: 'single' | 'rect' | 'circ';
    depth: number | '';
    peck: number | '';
    retract: number | '';
    feed: number | '';
    spindle: number | '';
    safeZ: number | '';
    singleX: number | '';
    singleY: number | '';
    rectCols: number | '';
    rectRows: number | '';
    rectSpacingX: number | '';
    rectSpacingY: number | '';
    rectStartX: number | '';
    rectStartY: number | '';
    circCenterX: number | '';
    circCenterY: number | '';
    circRadius: number | '';
    circHoles: number | '';
    circStartAngle: number | '';

    toolId: number | null;
}

export interface BoreParams {
    centerX: number | '';
    centerY: number | '';
    holeDiameter: number | '';
    holeDepth: number | '';
    counterboreEnabled: boolean;
    cbDiameter: number | '';
    cbDepth: number | '';
    depthPerPass: number | '';
    feed: number | '';
    plungeFeed: number | '';
    spindle: number | '';
    safeZ: number | '';

    stepover: number | '';
    toolId: number | null;
}

export interface PocketParams {
    shape: 'rect' | 'circ';
    width: number | '';
    length: number | '';
    cornerRadius: number | '';
    diameter: number | '';
    depth: number | '';
    depthPerPass: number | '';
    stepover: number | '';
    feed: number | '';
    plungeFeed: number | '';
    spindle: number | '';
    safeZ: number | '';

    toolId: number | null;
}

export interface ProfileParams {
    shape: 'rect' | 'circ';
    width: number | '';
    length: number | '';
    cornerRadius: number | '';
    diameter: number | '';
    depth: number | '';
    depthPerPass: number | '';
    cutSide: 'outside' | 'inside' | 'online';
    tabsEnabled: boolean;
    numTabs: number | '';
    tabWidth: number | '';
    tabHeight: number | '';
    feed: number | '';
    spindle: number | '';
    safeZ: number | '';

    toolId: number | null;
}

export interface SlotParams {
    type: 'straight' | 'arc';
    slotWidth: number | '';
    depth: number | '';
    depthPerPass: number | '';
    feed: number | '';
    spindle: number | '';
    safeZ: number | '';
    startX: number | '';
    startY: number | '';
    endX: number | '';
    endY: number | '';
    centerX: number | '';
    centerY: number | '';
    radius: number | '';
    startAngle: number | '';
    endAngle: number | '';

    toolId: number | null;
}

export interface TextParams {
    text: string;
    font: string;
    height: number | '';
    spacing: number | '';
    startX: number | '';
    startY: number | '';
    alignment: 'left' | 'center' | 'right';
    depth: number | '';
    feed: number | '';
    spindle: number | '';
    safeZ: number | '';

    toolId: number | null;
}

export interface ThreadMillingParams {
    type: 'internal' | 'external';
    hand: 'right' | 'left';
    diameter: number | '';
    pitch: number | '';
    depth: number | '';
    feed: number | '';
    spindle: number | '';
    safeZ: number | '';

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
    smoothing: number; // 0-10, default 0
    detail: number;
    quality: 'low' | 'medium' | 'high';
    colorAdjustmentEnabled: boolean;
    colorAdjustmentHigh: number | string;
    colorAdjustmentLow: number | string;
    colorAdjustmentMid: number | string;
}

export interface MortiseTenonParams {
    partToGenerate: 'mortise' | 'tenon' | 'both';
    jointType: 'standard' | 'tbone' | 'dogbone';
    width: number | '';
    height: number | '';
    depth: number | '';
    clearingWidth: number | '';
    clearingLength: number | '';
    tolerance: number | '';
    feed: number | '';
    plungeFeed: number | '';
    spindle: number | '';
    safeZ: number | '';
    depthPerPass: number | '';
    toolId: number | null;
}

export interface DadoRabbetParams {
    type: 'dado' | 'rabbet';
    orientation: 'horizontal' | 'vertical';
    width: number | '';
    length: number | '';
    depth: number | '';
    offsetX: number | '';
    offsetY: number | '';
    feed: number | '';
    plungeFeed: number | '';
    spindle: number | '';
    safeZ: number | '';
    depthPerPass: number | '';
    toolId: number | null;
}

export interface DecorativeJoineryParams {
    type: 'dovetail_inlay' | 'puzzle' | 'wave' | 'blind_mortise';
    length: number | '';
    width: number | '';
    depth: number | '';
    repeatCount: number | '';
    pitch: number | '';
    tolerance: number | '';
    inset: number | ''; // Distance from the edge for blind joints
    part: 'socket' | 'pin' | 'both';
    orientation: 'horizontal' | 'vertical';
    offsetX: number | '';
    offsetY: number | '';
    feed: number | '';
    plungeFeed: number | '';
    spindle: number | '';
    safeZ: number | '';
    depthPerPass: number | '';
    toolId: number | null;
}

export interface HalfLapParams {
    width: number | '';
    thickness: number | '';
    lapLength: number | '';
    jointType: 'standard' | 'mitered';
    partToGenerate: 'A' | 'B' | 'both';
    feed: number | '';
    plungeFeed: number | '';
    spindle: number | '';
    safeZ: number | '';
    depthPerPass: number | '';
    toolId: number | null;
    gap?: number | ''; // spacing between laps (glue gap), only used for mitered joints
}

export interface BoxJointParams {
    width: number | '';
    length: number | ''; // length is the board dimension along the joints
    depth: number | ''; // wood thickness
    fingerWidth: number | '';
    numberOfFingers?: number | '';
    tolerance: number | '';
    fingerStickOut?: number | '';
    partToGenerate: 'A' | 'B' | 'both';
    feed: number | '';
    plungeFeed: number | '';
    spindle: number | '';
    safeZ: number | '';
    depthPerPass: number | '';
    cornerClearance: 'none' | 'dogbone' | 'finger_cutout' | 't_bone';
    toolId: number | null;
    jointOnly: boolean;
}

export interface LockMitreParams {
    stockThickness: number | '';
    length: number | '';
    bitDiameter: number | '';
    bitAngle: number | '';
    feedRate: number | '';
    stepover: number | '';
    useSteppedVersion: boolean;
    stepdown: number | '';
    toolId: number | null;
    partToGenerate: 'A' | 'B' | 'both';
}

export interface DrawerParams {
    joineryType: 'finger' | 'butt';
    bottomType?: 'flat' | 'groove' | 'rabbet';
    bottomChannelDepth?: number | '';
    bottomWoodThickness?: number | '';
    bottomZClearance?: number | '';
    cornerClearance?: 'none' | 'dogbone' | 'finger_cutout' | 't_bone';
    partToGenerate: 'all' | 'front' | 'back' | 'left' | 'right' | 'bottom';
    width: number | '';
    height: number | '';
    depth: number | '';
    woodThickness: number | '';
    fingerWidth: number | '';
    tolerance: number | '';
    feed: number | '';
    plungeFeed: number | '';
    spindle: number | '';
    safeZ: number | '';
    depthPerPass: number | '';
    toolId: number | null;
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

export interface SVGParams {
    file: File | null;
    fileName: string;
    svgContent: string;
    scale: number | string;
    rotation: number | string;
    positionX: number | string;
    positionY: number | string;
    depth: number | string;
    feed: number | string;
    spindle: number | string;
    safeZ: number | string;
    toolId: number | null;
}

export interface CabinetParams {
    width: number | '';
    height: number | '';
    depth: number | '';
    woodThickness: number | '';
    backThickness: number | '';
    
    // Toe Kick
    hasToeKick: boolean;
    toeKickHeight: number | '';
    toeKickDepth: number | '';
    
    // Layout / Content
    configuration: 'shelves' | 'drawers' | 'doors' | 'appliance' | 'empty';
    numShelves: number | '';
    shelfThickness: number | '';
    numDrawers: number | '';
    
    // Joinery
    joineryType: 'butt' | 'pocket' | 'joinery';
    cornerClearance?: 'none' | 'dogbone' | 'finger_cutout' | 't_bone';
    fingerWidth?: number | '';
    tolerance?: number | '';
    
    // Machining
    feed: number | '';
    plungeFeed: number | '';
    spindle: number | '';
    safeZ: number | '';
    depthPerPass: number | '';
    toolId: number | null;
    
    // Part selection
    partToGenerate: 'all' | 'sides' | 'top' | 'bottom' | 'back' | 'shelves' | 'toe_kick' | 'doors' | 'drawers';
}
export interface LockMitreParams {
    stockThickness: number | '';
    length: number | '';
    bitDiameter: number | '';
    bitAngle: number | '';
    feedRate: number | '';
    stepover: number | '';
    useSteppedVersion: boolean;
    stepdown: number | '';
    toolId: number | null;
    partToGenerate: 'A' | 'B' | 'both';
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
    svg: SVGParams;
    drawer: DrawerParams;
    mortisetenon: MortiseTenonParams;
    dadorabbet: DadoRabbetParams;
    decorative: DecorativeJoineryParams;
    cabinet: CabinetParams;
    halfLap: HalfLapParams;
    boxjoint: BoxJointParams;
    lockMitre: LockMitreParams;
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
    mode?: 'local' | 'webrtc' | string;
    webRTCUrl?: string;
    webRTCAutoConnect?: boolean;
}

export interface BoundingBox {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
}

export interface ToolpathSegmentMetadata {
    startVertexIndex: number;
    vertexCount: number;
    boundingBox: BoundingBox;
    gcodeSegmentIndex: number;
}

export interface GCodePoint {
    x: number;
    y: number;
    z: number;
}

export interface WorkspaceBookmark {
    id: string;
    name: string;
    position: MachinePosition; // Work position (WPOS) or Offset from work position
    mpos?: MachinePosition;    // Machine position (MPOS)
    wcs?: string;              // Current WCS (e.g. G54)
    wco?: MachinePosition;     // WCS Offset
    reference: 'machine' | 'work'; // Added reference type
    jobId?: string;
    jobName?: string;
    snapshot?: string;          // Optional webcam snapshot (DataURL)
    toolId?: number;            // Tool loaded when saved
    category?: string;          // For grouping
    commands?: string[];        // Mini-macro commands
    isProbed?: boolean;         // Flag if saved from probing
}
