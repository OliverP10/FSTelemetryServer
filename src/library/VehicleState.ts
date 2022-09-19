import { Logger } from 'winston';
import { BuildLogger } from './Logger';

export class VehicleSate {
    logger: Logger;

    constructor() {
        this.logger = BuildLogger('VehicleSate');
    }
}
