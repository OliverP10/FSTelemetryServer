import { ILabelBoundry } from '../models/LabelMappings';

export interface RawTelemetry {
    i: number;
    d: any;
}

export interface LabelMapping {
    functionName?: string;
    params?: any;
    nominalBoundry: ILabelBoundry;
    warningBoundry: ILabelBoundry[];
}
