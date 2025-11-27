import { Controller } from './Controller';
import { GrblController } from './GrblController';
import { MarlinController } from './MarlinController';
import { MachineSettings } from '../types';

export class ControllerFactory {
    static createController(type: string, settings: MachineSettings): Controller {
        switch (type) {
            case 'grbl':
                return new GrblController(settings);
            case 'marlin':
                return new MarlinController();
            default:
                throw new Error(`Unsupported controller type: ${type}`);
        }
    }
}
