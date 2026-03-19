import { Activity } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { ArrowDown } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { ArrowRightLeft } from 'lucide-react';
import { ArrowUp } from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { Calculator } from 'lucide-react';
import { Camera } from 'lucide-react';
import { CameraOff } from 'lucide-react';
import { Check } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { ChevronsLeft } from 'lucide-react';
import { ChevronsRight } from 'lucide-react';
import { ChevronUp } from 'lucide-react';
import { Circle } from 'lucide-react';
import { Clock } from 'lucide-react';
import { Code } from 'lucide-react';
import { Code2 } from 'lucide-react';
import { Cpu } from 'lucide-react';
import { Crosshair } from 'lucide-react';
import { default as default_2 } from 'react';
import { Dock } from 'lucide-react';
import { Download } from 'lucide-react';
import { Eye } from 'lucide-react';
import { FileText } from 'lucide-react';
import { FolderOpen } from 'lucide-react';
import { GripHorizontal } from 'lucide-react';
import { Hand } from 'lucide-react';
import { History as History_2 } from 'lucide-react';
import { Home } from 'lucide-react';
import { Image as Image_2 } from 'lucide-react';
import { Info } from 'lucide-react';
import { Keyboard } from 'lucide-react';
import { Layers } from 'lucide-react';
import { Maximize } from 'lucide-react';
import { Minimize } from 'lucide-react';
import { Minus } from 'lucide-react';
import { Moon } from 'lucide-react';
import { Move } from 'lucide-react';
import { OctagonAlert } from 'lucide-react';
import { Pause } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { Percent } from 'lucide-react';
import { PictureInPicture } from 'lucide-react';
import { Pin } from 'lucide-react';
import { Play } from 'lucide-react';
import { PlayCircle } from 'lucide-react';
import { Plus } from 'lucide-react';
import { PlusCircle } from 'lucide-react';
import { Power } from 'lucide-react';
import { PowerOff } from 'lucide-react';
import { Radio } from 'lucide-react';
import { Redo } from 'lucide-react';
import { RefreshCw } from 'lucide-react';
import { RotateCcw } from 'lucide-react';
import { RotateCw } from 'lucide-react';
import { Ruler } from 'lucide-react';
import { Save } from 'lucide-react';
import { Search } from 'lucide-react';
import { Send } from 'lucide-react';
import { Settings } from 'lucide-react';
import { Square } from 'lucide-react';
import { Sun } from 'lucide-react';
import { Terminal } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Undo } from 'lucide-react';
import { Unlock } from 'lucide-react';
import { Upload } from 'lucide-react';
import { Volume2 } from 'lucide-react';
import { VolumeX } from 'lucide-react';
import { Wand } from 'lucide-react';
import { X } from 'lucide-react';
import { Zap } from 'lucide-react';
import { ZapOff } from 'lucide-react';
import { ZoomIn } from 'lucide-react';
import { ZoomOut } from 'lucide-react';

export { Activity }

export { AlertTriangle }

export declare const analyzeGCodeWithWorker: (createWorker: () => Worker, gcodeLines: string[], settings: any) => Promise<any>;

export { ArrowDown }

export { ArrowLeft }

export { ArrowRight }

export { ArrowRightLeft }

export { ArrowUp }

export { BookOpen }

export declare interface BoreParams {
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

export declare interface BoundingBox {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
}

export declare interface BoxJointParams {
    width: number | '';
    length: number | '';
    depth: number | '';
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

export declare interface CabinetParams {
    width: number | '';
    height: number | '';
    depth: number | '';
    woodThickness: number | '';
    backThickness: number | '';
    hasToeKick: boolean;
    toeKickHeight: number | '';
    toeKickDepth: number | '';
    configuration: 'shelves' | 'drawers' | 'doors' | 'appliance' | 'empty';
    numShelves: number | '';
    shelfThickness: number | '';
    numDrawers: number | '';
    joineryType: 'butt' | 'pocket' | 'joinery';
    cornerClearance?: 'none' | 'dogbone' | 'finger_cutout' | 't_bone';
    fingerWidth?: number | '';
    tolerance?: number | '';
    feed: number | '';
    plungeFeed: number | '';
    spindle: number | '';
    safeZ: number | '';
    depthPerPass: number | '';
    toolId: number | null;
    partToGenerate: 'all' | 'sides' | 'top' | 'bottom' | 'back' | 'shelves' | 'toe_kick' | 'doors' | 'drawers';
}

export { Calculator }

export { Camera }

export { CameraOff }

export { Check }

export { CheckCircle }

export { ChevronDown }

export { ChevronRight }

export { ChevronsLeft }

export { ChevronsRight }

export { ChevronUp }

export { Circle }

export { Clock }

export { Code }

export { Code2 }

export declare function configureMonaco(): Promise<any>;

export declare interface ConnectionOptions {
    type: 'usb' | 'tcp' | 'simulator';
    ip?: string;
    port?: number;
    baudRate?: number;
}

export declare interface ConsoleLog {
    type: 'sent' | 'received' | 'status' | 'error' | 'info';
    message: string;
    timestamp?: Date;
}

export declare const Contrast: default_2.FC<IconProps>;

export { Cpu }

export { Crosshair }

export declare const CrosshairX: default_2.FC<IconProps>;

export declare const CrosshairXY: default_2.FC<IconProps>;

export declare const CrosshairY: default_2.FC<IconProps>;

export declare const CrosshairZ: default_2.FC<IconProps>;

export declare type CutDirection = 'up' | 'down' | 'compression';

export declare interface DadoRabbetParams {
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

export declare interface DecorativeJoineryParams {
    type: 'dovetail_inlay' | 'puzzle' | 'wave' | 'blind_mortise';
    length: number | '';
    width: number | '';
    depth: number | '';
    repeatCount: number | '';
    pitch: number | '';
    tolerance: number | '';
    inset: number | '';
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

export declare const DEFAULT_GENERATOR_SETTINGS: GeneratorSettings;

export declare const DEFAULT_MACROS: Macro[];

export declare const DEFAULT_SETTINGS: MachineSettings;

export declare const DEFAULT_TOOLS: Tool[];

export declare const DEFAULT_WEBCAM_SETTINGS: WebcamSettings;

export { Dock }

export { Download }

export declare interface DrawerParams {
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

export declare interface DrillingParams {
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

export declare const estimateGCodeTime: (gcodeLines: string[]) => TimeEstimate_2;

export { Eye }

export { FileText }

export { FolderOpen }

export declare interface GCodeAnalysisState {
    spindle: 'M3' | 'M4' | 'M5';
    speed: number | null;
    coolant: 'M7' | 'M8' | 'M9';
    workCoordinateSystem: string;
    unitMode: 'G20' | 'G21';
    distanceMode: 'G90' | 'G91';
    feedRate: number | null;
}

export declare const GCodeEditorModal: default_2.FC<GCodeEditorModalProps>;

declare interface GCodeEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialContent: string;
    fileName: string;
    onSaveToApp: (content: string) => void;
    onSaveToDisk: (content: string, filename: string) => void;
    machineSettings: MachineSettings;
    unit: 'mm' | 'in';
    isLightMode: boolean;
    TouchInputComponent?: default_2.ComponentType<any>;
}

export declare const GCodeLine: default_2.FC<GCodeLineProps>;

declare interface GCodeLineProps {
    line: string;
    lineNumber: number;
    isExecuted: boolean;
    isCurrent: boolean;
    isHovered: boolean;
    onRunFromHere: (lineNumber: number) => void;
    isActionable: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export declare interface GCodePoint {
    x: number;
    y: number;
    z: number;
}

export declare interface GCodeSegment {
    type: 'G0' | 'G1' | 'G2' | 'G3';
    start: GCodePoint;
    end: GCodePoint;
    center?: GCodePoint;
    clockwise?: boolean;
    line: number;
}

export declare const GCodeVisualizer: default_2.ForwardRefExoticComponent<GCodeVisualizerProps & default_2.RefAttributes<GCodeVisualizerHandle>>;

export declare interface GCodeVisualizerHandle {
    fitView: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
}

declare interface GCodeVisualizerProps {
    gcodeLines: string[];
    currentLine: number;
    hoveredLineIndex: number | null;
    machineSettings: MachineSettings;
    unit: 'mm' | 'in';
    createWorker: () => Worker;
}

export declare interface GeneratorSettings {
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

export declare const getMachineStateAtLine: (gcodeLines: string[], lineNumber: number) => GCodeAnalysisState;

export declare const GRBL_ALARM_CODES: {
    [key: number | string]: {
        name: string;
        desc: string;
        resolution: string;
    };
};

export declare const GRBL_ERROR_CODES: {
    [key: number]: string;
};

export declare const GRBL_REALTIME_COMMANDS: {
    readonly RESET: "\u0018";
    readonly STATUS_REPORT: "?";
    readonly CYCLE_START: "~";
    readonly FEED_HOLD: "!";
    readonly SAFETY_DOOR: "";
    readonly JOG_CANCEL: "\u0085";
    readonly FEED_OVR_RESET: "";
    readonly FEED_OVR_COARSE_PLUS: "";
    readonly FEED_OVR_COARSE_MINUS: "";
    readonly FEED_OVR_FINE_PLUS: "";
    readonly FEED_OVR_FINE_MINUS: "";
    readonly RAPID_OVR_RESET: "";
    readonly RAPID_OVR_MEDIUM: "";
    readonly RAPID_OVR_LOW: "";
    readonly SPINDLE_OVR_RESET: "";
    readonly SPINDLE_OVR_COARSE_PLUS: "";
    readonly SPINDLE_OVR_COARSE_MINUS: "";
    readonly SPINDLE_OVR_FINE_PLUS: "";
    readonly SPINDLE_OVR_FINE_MINUS: "";
    readonly TOGGLE_SPINDLE_STOP: "";
    readonly TOGGLE_FLOOD_COOLANT: " ";
    readonly TOGGLE_MIST_COOLANT: "¡";
};

export { GripHorizontal }

export declare interface HalfLapParams {
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
}

export { Hand }

export { History_2 as History }

export { Home }

export declare const HomeX: default_2.FC<IconProps>;

export declare const HomeXY: default_2.FC<IconProps>;

export declare const HomeY: default_2.FC<IconProps>;

export declare const HomeZ: default_2.FC<IconProps>;

declare type IconProps = default_2.SVGProps<SVGSVGElement>;

export { Image_2 as Image }

export { Info }

export declare enum JobStatus {
    Idle = "idle",
    Running = "running",
    Paused = "paused",
    Stopped = "stopped",
    Complete = "complete"
}

export { Keyboard }

export { Layers }

export declare interface LockMitreParams {
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

export declare interface LockMitreParams {
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

export declare interface MachinePosition {
    x: number;
    y: number;
    z: number;
}

export declare interface MachineSettings {
    controllerType: string;
    workArea: {
        x: number;
        y: number;
        z: number;
    };
    jogFeedRate: number;
    spindle: {
        min: number;
        max: number;
        warmupDelay: number;
    };
    probe: {
        xOffset: number;
        yOffset: number;
        zOffset: number;
        fastFeedRate: number;
        slowFeedRate: number;
        probeTravelDistance: number;
        retractDistance: number;
        blockWidthX: number;
        blockWidthY: number;
        blockHeight: number;
        bitDiameter: number;
    };
    scripts: {
        startup: string;
        toolChange: string;
        shutdown: string;
        jobPause: string;
        jobResume: string;
        jobStop: string;
    };
    toolChangePolicy?: 'native' | 'macro';
    toolChangeMacroId?: string | null;
    isConfigured?: boolean;
    playCompletionSound?: boolean;
    isVirtualKeyboardEnabled?: boolean;
}

export declare interface MachineState {
    status: 'Idle' | 'Run' | 'Hold' | 'Jog' | 'Alarm' | 'Door' | 'Check' | 'Home' | 'Sleep';
    code?: number;
    wpos: MachinePosition;
    mpos: MachinePosition;
    wco: MachinePosition;
    wcs: string;
    spindle: {
        state: 'cw' | 'ccw' | 'off';
        speed: number;
    };
    ov: number[];
    pins?: string;
}

export declare interface Macro {
    name: string;
    description?: string;
    commands: string[];
}

export { Maximize }

export { Minimize }

export { Minus }

export { Moon }

export declare interface MortiseTenonParams {
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

export { Move }

export { OctagonAlert }

export declare interface ParsedGCode {
    segments: GCodeSegment[];
    bounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
        minZ: number;
        maxZ: number;
    };
}

export declare const parseGCode: (gcodeLines: string[]) => ParsedGCode;

export { Pause }

export { Pencil }

export { Percent }

export { PictureInPicture }

export { Pin }

export { Play }

export { PlayCircle }

export { Plus }

export { PlusCircle }

export declare interface PocketParams {
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

export declare interface PortInfo {
    portName?: string;
    manufacturer?: string;
    type: 'usb' | 'tcp' | 'simulator';
    ip?: string;
    port?: number;
    usbVendorId?: number;
    usbProductId?: number;
}

export { Power }

export { PowerOff }

export declare const Probe: default_2.FC<IconProps>;

export declare const ProbeX: default_2.FC<IconProps>;

export declare const ProbeXY: default_2.FC<IconProps>;

export declare const ProbeXYZ: default_2.FC<IconProps>;

export declare const ProbeY: default_2.FC<IconProps>;

export declare interface ProfileParams {
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

export { Radio }

export { Redo }

export { RefreshCw }

export declare interface ReliefParams {
    imageDataUrl: string | null;
    invert: boolean;
    width: number | string;
    length: number | string;
    maxDepth: number | string;
    zSafe: number | string;
    roughingEnabled: boolean;
    roughingToolId: number | null;
    roughingStepdown: number | string;
    roughingStepover: number | string;
    roughingStockToLeave: number | string;
    roughingFeed: number | string;
    roughingSpindle: number | string;
    finishingEnabled: boolean;
    finishingToolId: number | null;
    finishingStepover: number | string;
    finishingAngle: number | string;
    finishingFeed: number | string;
    finishingSpindle: number | string;
    operation: 'both' | 'roughing' | 'finishing';
    keepAspectRatio: boolean;
    gamma: number;
    contrast: number;
    smoothing: number;
    detail: number;
    quality: 'low' | 'medium' | 'high';
    colorAdjustmentEnabled: boolean;
    colorAdjustmentHigh: number | string;
    colorAdjustmentLow: number | string;
    colorAdjustmentMid: number | string;
}

export { RotateCcw }

export { RotateCw }

export { Ruler }

export { Save }

export { Search }

export { Send }

export { Settings }

export declare interface SlotParams {
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

export { Square }

export declare interface STLParams {
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

export { Sun }

export declare interface SurfacingParams {
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

export declare interface SVGParams {
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

declare interface Tab {
    id: string;
    label: string;
    icon?: default_2.ReactNode;
    content: default_2.ReactNode;
}

export declare const Tabs: default_2.FC<TabsProps>;

declare interface TabsProps {
    tabs: Tab[];
    defaultTab?: string;
    className?: string;
}

export { Terminal }

export declare interface TextParams {
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

export declare const ThemeToggle: default_2.FC<ThemeToggleProps>;

declare interface ThemeToggleProps {
    isLightMode: boolean;
    onToggle: () => void;
}

export declare interface ThreadMillingParams {
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

export declare interface TimeEstimate {
    totalTime: number;
    remainingTime: number;
}

declare interface TimeEstimate_2 {
    totalSeconds: number;
    cumulativeSeconds: number[];
}

export declare interface Tool {
    id: number;
    name: string;
    diameter: number | '';
    type: ToolType;
    flutes: number | '';
    cutDirection: CutDirection;
}

export declare interface ToolpathSegmentMetadata {
    startVertexIndex: number;
    vertexCount: number;
    boundingBox: BoundingBox;
    gcodeSegmentIndex: number;
}

export declare type ToolType = 'endmill' | 'ballmill' | 'bullhead' | 'vbit30' | 'vbit60' | 'vbit90' | 'surfacing' | 'cornmill';

export { Trash2 }

export { Undo }

export { Unlock }

export { Upload }

export { Volume2 }

export { VolumeX }

export { Wand }

export declare interface WebcamSettings {
    selectedDeviceId: string;
    selectedAudioDeviceId: string;
    volume: number;
    isMuted: boolean;
    mode?: 'local' | 'webrtc' | string;
    webRTCUrl?: string;
    webRTCAutoConnect?: boolean;
}

export declare interface WorkspaceBookmark {
    id: string;
    name: string;
    position: MachinePosition;
    mpos?: MachinePosition;
    wcs?: string;
    wco?: MachinePosition;
    reference: 'machine' | 'work';
    jobId?: string;
    jobName?: string;
    snapshot?: string;
    toolId?: number;
    category?: string;
    commands?: string[];
    isProbed?: boolean;
}

export { X }

export { Zap }

export { ZapOff }

export { ZoomIn }

export { ZoomOut }

export { }
