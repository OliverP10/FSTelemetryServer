import mongoose, { Document, Schema } from 'mongoose';

export interface IScreenItem {
    location: string;
    display: string;
    colSize: number;
    rowSize: number;
    options: any;
}

export interface IScreenItemModel extends IScreenItem, Document {}

const ScreenItemSchema: Schema = new Schema(
    {
        location: { type: String, required: true },
        display: { type: Schema.Types.ObjectId, required: true, ref: 'displays' },
        colSize: { type: Number, required: true },
        rowSize: { type: Number, required: true },
        options: { type: Object, required: true }
    },
    { minimize: false, versionKey: false }
);

ScreenItemSchema.index(
    {
        location: 1,
        display: -1
    },
    { unique: true }
);

export default mongoose.model<IScreenItemModel>('screen_items', ScreenItemSchema);
