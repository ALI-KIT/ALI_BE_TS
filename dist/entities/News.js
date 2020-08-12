"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsSchema = exports.ShortNews = void 0;
const mongoose_1 = require("mongoose");
class ShortNews {
    constructor(title, summary, author = '', thumbnail = '') {
        this.title = title;
        this.summary = summary;
        this.author = author;
        this.thumbnail = thumbnail;
    }
}
exports.ShortNews = ShortNews;
exports.NewsSchema = new mongoose_1.Schema({
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
});
