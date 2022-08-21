import mongoose, { Document, Schema } from 'mongoose';
import { Boundry } from './DataBoundry';
let ObjectId = mongoose.Schema.Types.ObjectId;

export interface IDataMapping {
    functionName?: string;
    params?: any;
    nominalBoundry: Boundry;
    warningBoundry: Boundry[];
}

export interface IDataMappingsModel extends IDataMapping, Document {}

const DataMappingSchema = new Schema({
    functionName: String,
    params: { Object, required: false },
    nominalBoundry: { type: ObjectId, ref: 'DataBoundrySchema' },
    warningBoundry: [{ type: ObjectId, ref: 'DataBoundrySchema' }]
});

export default mongoose.model<IDataMappingsModel>('DataMapping', DataMappingSchema);
