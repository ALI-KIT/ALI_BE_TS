import { Schema, Document } from "mongoose";

export interface TrendsRating {
    name: string,
    total: number,
    data: { text: string, count: number, status: number }[],
    updatedAt: Date
}

export interface TrendsRatingDocument extends TrendsRating, Document { }

export const TrendsRatingSchema = new Schema<TrendsRatingDocument>({
    name: { type: String, default: "trends-rating" },
    total: { type: Number, required: true, default: 0 },
    data: [{
        text: { type: String, required: true },
        count: { type: Number, default: 0 },
        status: { type: Number, default: 0 }
    }],
    updatedAt: { type: Date, default: Date.now() }
});