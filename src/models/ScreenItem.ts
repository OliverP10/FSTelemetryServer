import mongoose, { Document, Schema } from 'mongoose';

export interface IScreenItem {
    display: string;
    colSize: number;
    rowSize: number;
    options: any;
}

export interface IScreenItemModel extends IScreenItem, Document {}

const ScreenItemSchema: Schema = new Schema(
    {
        display: { type: Schema.Types.ObjectId, required: true, ref: 'displays' },
        colSize: { type: Number, required: true },
        rowSize: { type: Number, required: true },
        options: { type: Object, required: true }
    },
    { minimize: false, versionKey: false }
);

export default mongoose.model<IScreenItemModel>('screen_items', ScreenItemSchema);
