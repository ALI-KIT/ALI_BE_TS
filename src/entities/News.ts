import { Document, Schema, model } from 'mongoose';

export interface News extends Document {
    title: string,
    dated: Date,
    category: string,
    summary: string,
    content: string,
    auth: string,
    site: string,
    url: string,
    source: string,
    thumbnail: string
}

export class ShortNews {
    public title: string
    public summary: string
    public author: string
    public thumbnail: string


    public constructor(title: string, summary: string, author: string = '', thumbnail: string = '') {
        this.title = title;
        this.summary = summary;
        this.author = author;
        this.thumbnail = thumbnail;
    }
}

export const NewsSchema = new Schema({
    title: {
        type: String,
        required: true,
        default: ''
    },
    category: {
        type: String,
        required: true,
        default: ''
    },
    summary: {
        type: String,
        required: true,
        default: ''
    },
    content: {
        type: String,
        required: true,
        default: ''
    },
    auth: {
        type: String,
        required: true,
        default: ''
    },
    site: {
        type: String,
        required: true,
        default: ''
    },
    url: {
        type: String,
        required: true,
        default: ''
    },
    source: {
        type: String,
        required: true,
        default: ''
    },
    thumbnail: {
        type: String,
        required: true,
        default: ''
    }
})