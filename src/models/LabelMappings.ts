import mongoose, { Document, Schema } from 'mongoose';

export interface ILabelBoundry {
    from: number;
    to: number;
}

const LabelBoundrySchema = new Schema(
    {
        from: { type: Number, required: true },
        to: { type: Number, required: true }
    },
    { minimize: false }
);

export interface ILabelMapping {
    label: string;
    functionName?: string;
    params?: any;
    nominalBoundry: ILabelBoundry;
    warningBoundry: ILabelBoundry[];
}

export interface ILabelMappingsModel extends ILabelMapping, Document {}

const LabelMappingSchema: Schema = new Schema(
    {
        label: { type: String, required: true, unique: true },
        functionName: { type: String, required: false },
        params: { type: Object, required: false },
        nominalBoundry: LabelBoundrySchema,
        warningBoundry: [LabelBoundrySchema]
    },
    { minimize: false, versionKey: false }
);

export default mongoose.model<ILabelMappingsModel>('labelmappings', LabelMappingSchema);
