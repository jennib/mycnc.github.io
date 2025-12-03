import { GrblController } from './GrblController';
import { MachineSettings } from "@mycnc/shared";

/**
 * Smoothieware Controller
 * 
 * Smoothieware is a GRBL-compatible firmware designed for 32-bit controllers.
 * It uses a GRBL-like protocol with some extensions and differences:
 * - Temperature control commands (M104, M109, M140, M190)
 * - Configuration file system (config.txt)
 * - Extended M-codes for advanced features
 * 
 * For now, it inherits all behavior from GrblController since the core
 * G-code protocol is compatible. Future enhancements could include:
 * - Temperature monitoring and control
 * - Configuration management
 * - Smoothie-specific M-codes
 */
export class SmoothiewareController extends GrblController {
    constructor(settings: MachineSettings) {
        super(settings);
    }

    // Override methods here if Smoothieware-specific behavior is needed
}
