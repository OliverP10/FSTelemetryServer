import mongoose from 'mongoose'
let ObjectId = mongoose.Schema.Types.ObjectId;

export interface Boundry {
    from: number,
    to: number
}

const DataBoundrySchema = new mongoose.Schema({
    from: Number,
    to: Number
},)


export default mongoose.model("DataBoundery", DataBoundrySchema)