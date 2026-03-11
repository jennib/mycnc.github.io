import type {
    JobStatus as JobStatusShared,
    Tool,
    Macro,
    MachineSettings,
    ConsoleLog,
    MachinePosition,
    PortInfo,
    ConnectionOptions,
    MachineState,
    SurfacingParams,
    DrillingParams,
    BoreParams,
    PocketParams,
    ProfileParams,
    SlotParams,
    TextParams,
    ThreadMillingParams,
    ReliefParams,
    STLParams,
    SVGParams,
    GeneratorSettings,
    TimeEstimate,
    WebcamSettings,
    GCodePoint,
    DrawerParams,
    MortiseTenonParams,
    DadoRabbetParams,
    DecorativeJoineryParams,
    CabinetParams
} from '@mycnc/shared';
import { JobStatus } from '@mycnc/shared';

export { JobStatus };
export type {
    Tool,
    Macro,
    MachineSettings,
    ConsoleLog,
    MachinePosition,
    PortInfo,
    ConnectionOptions,
    MachineState,
    SurfacingParams,
    DrillingParams,
    BoreParams,
    PocketParams,
    ProfileParams,
    SlotParams,
    TextParams,
    ThreadMillingParams,
    ReliefParams,
    STLParams,
    SVGParams,
    GeneratorSettings,
    TimeEstimate,
    WebcamSettings,
    GCodePoint,
    DrawerParams,
    MortiseTenonParams,
    DadoRabbetParams,
    DecorativeJoineryParams,
    CabinetParams
};

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
