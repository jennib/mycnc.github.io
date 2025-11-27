import { Controller } from './Controller';
import { GrblController } from './GrblController';
import { MarlinController } from './MarlinController';
import { FluidNCController } from './FluidNCController';
import { GrblHALController } from './GrblHALController';
import { SmoothiewareController } from './SmoothiewareController';
import { TinyGController } from './TinyGController';
import { LinuxCNCController } from './LinuxCNCController';
import { MachineSettings } from '../types';

export class ControllerFactory {
    static createController(type: string, settings: MachineSettings): Controller {
        switch (type) {
            case 'grbl':
                return new GrblController(settings);
            case 'marlin':
                return new MarlinController(settings);
            case 'fluidnc':
                return new FluidNCController(settings);
            case 'grblhal':
                return new GrblHALController(settings);
            case 'smoothieware':
                return new SmoothiewareController(settings);
            case 'tinyg':
                return new TinyGController(settings);
            case 'linuxcnc':
                return new LinuxCNCController(settings);
            default:
                throw new Error(`Unsupported controller type: ${type}`);
        }
    }
}
