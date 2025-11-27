import { GrblController } from './GrblController';
import { MachineSettings } from '../types';

/**
 * FluidNC Controller
 * 
 * FluidNC is a next-generation GRBL-compatible firmware with additional features
 * like WiFi support, multiple motor drivers, and more flexible configuration.
 * 
 * For now, it inherits all behavior from GrblController since it maintains
 * GRBL protocol compatibility. Future enhancements could include:
 * - WiFi/Bluetooth connection support
 * - Extended status reporting
 * - FluidNC-specific configuration commands
 */
export class FluidNCController extends GrblController {
    constructor(settings: MachineSettings) {
        super(settings);
    }

    // Override methods here if FluidNC-specific behavior is needed
}
