import mongoose, { Document, Schema } from 'mongoose';

export interface ITelemetryMetadata {
    label: string;
    type: string;
    location: string;
}

const telemetryMetadata = new Schema(
    {
        label: { type: String, required: true },
        type: { type: String, required: true },
        location: { type: String, required: true }
    },
    { minimize: false }
);

export interface ITelemetry {
    timestamp: Date;
    metadata: ITelemetryMetadata;
    value: any;
}

export interface ITelemetryModel extends ITelemetry, Document {}

const TelemetrySchema: Schema = new Schema(
    {
        timestamp: { type: Date, required: true },
        metadata: { type: telemetryMetadata, required: true },
        value: { type: Object, required: true }
    },
    {
        timeseries: {
            timeField: 'timestamp',
            metaField: 'metadata',
            granularity: 'seconds'
        },
        minimize: false,
        versionKey: false
    }
);

export default mongoose.model<ITelemetryModel>('telemetry', TelemetrySchema, 'telemetry');
