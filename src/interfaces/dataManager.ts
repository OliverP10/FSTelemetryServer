import { IEvent } from '../models/Event';
import { ITelemetry } from '../models/Telemetry';

export interface OffsetParam {
    offsetBy: number;
}

export interface normalizeParam {
    min: number;
    max: number;
    multiplier: number;
}

export interface LinearConvertionParam {
    oldMin: number;
    oldMax: number;
    newMin: number;
    newMax: number;
}

export interface ProcessedData {
    telemetry: ITelemetry;
    events: IEvent[];
}
