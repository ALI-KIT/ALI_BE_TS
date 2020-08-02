import { Schema, Document, model } from 'mongoose';

export interface Place extends Document {
    name: string,
    dated: Date,
    keywords: string[],
    regex: string,
    flat: string
}

export const PlaceSchema = new Schema({
    name: String,
    dated: {
        type: Date,
        default: Date.now()
    },
    keywords: [String],
    regex: String,
    flat: {
        type: String,
        default: 'iu'
    }
});