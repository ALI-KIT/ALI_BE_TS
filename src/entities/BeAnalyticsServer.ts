import { Document, Schema } from "mongoose";

export interface BeAnalyticsServer extends Document {
    name: string;
    displayName: string;
    analyticsUrl: string;
    apiUrl: string;
}

export const BeAnalyticsServerSchema = new Schema<BeAnalyticsServer>({
    name: { type: String, required: true, unique: true },
    displayName: { type: String, required: false, default: '' },
    analyticsUrl: { type: String, required: true },
    apiUrl: { type: String, required: true }
});