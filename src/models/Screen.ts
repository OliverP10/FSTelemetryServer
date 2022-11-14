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

export interface IScreen {
    name: string;
    screenItems: IScreenItem[];
}

export interface IScreenModel extends IScreen, Document {}

const ScreenSchema: Schema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        screenItems: { type: [ScreenItemSchema], required: true }
    },
    { minimize: false, versionKey: false }
);

export default mongoose.model<IScreenModel>('screens', ScreenSchema);
