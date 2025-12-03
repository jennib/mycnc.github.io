import { GrblController } from './GrblController';
import { MachineSettings } from "@mycnc/shared";

/**
 * grblHAL Controller
 * 
 * grblHAL is an advanced GRBL variant with HAL (Hardware Abstraction Layer)
 * supporting multiple platforms and additional features while maintaining
 * GRBL protocol compatibility.
 * 
 * For now, it inherits all behavior from GrblController. Future enhancements
 * could include:
 * - Advanced probing capabilities
 * - Plugin system support
 * - Extended machine capabilities reporting
 */
export class GrblHALController extends GrblController {
    constructor(settings: MachineSettings) {
        super(settings);
    }

    // Override methods here if grblHAL-specific behavior is needed
}
