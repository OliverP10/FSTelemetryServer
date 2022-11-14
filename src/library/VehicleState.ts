import { Logger } from 'winston';
import { BuildLogger } from './Logger';

export class VehicleSate {
    logger: Logger;

    roverConnected: boolean = false;

    constructor() {
        this.logger = BuildLogger('VehicleSate');
    }
}
