import mongoose, { Document, Schema } from 'mongoose';

export interface IDisplay {
    title: string;
    type: string;
    colSize: number;
    rowSize: number;
    labels: string[];
    options: any;
}

export interface IDisplayModel extends IDisplay, Document {}

const DisplaySchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        type: { type: String, required: true },
        colSize: { type: Number, required: true },
        rowSize: { type: Number, required: true },
        labels: [{ type: String, required: true }],
        options: { type: Object, required: true }
    },
    { minimize: false, versionKey: false }
);

DisplaySchema.index(
    {
        title: 1,
        type: -1
    },
    { unique: true }
);

export default mongoose.model<IDisplayModel>('displays', DisplaySchema);
