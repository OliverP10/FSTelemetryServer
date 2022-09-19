import mongoose, { Document, Schema } from 'mongoose';

export interface IEventMetadata {
    type: string;
    location: string;
}

const eventMetadata = new Schema(
    {
        type: { type: String, required: true },
        location: { type: String, required: true }
    },
    { minimize: false }
);

export interface IEvent {
    timestamp: Date;
    metadata: IEventMetadata;
    trigger: string;
    message: string;
}

export interface IEventModel extends IEvent, Document {}

const EventSchema: Schema = new Schema(
    {
        timestamp: { type: Date, required: true },
        metadata: { type: eventMetadata, required: true },
        trigger: { type: String, required: true },
        message: { type: String, required: true }
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

export default mongoose.model<IEventModel>('events', EventSchema);
