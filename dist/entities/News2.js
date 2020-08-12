"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsSchema = void 0;
const mongoose_1 = require("mongoose");
exports.NewsSchema = new mongoose_1.Schema({
    title: { type: String, required: true, default: '' },
    summary: { type: String, required: true, default: '' },
    content: { type: String, required: true, default: '' },
    thumbnail: { type: String, required: false, default: '' },
    crawlDate: {
        type: Date,
        default: Date.now()
    },
    publicationDate: {
        type: Date,
        default: Date.now()
    },
    aggregator: {
        name: { type: String, default: '' },
        displayName: { type: String, default: '' },
        baseUrl: { type: String, default: '' },
        url: { type: String, default: '' },
        required: false
    },
    source: {
        name: { type: String, default: '' },
        displayName: { type: String, default: '' },
        baseUrl: { type: String, default: '' },
        url: { type: String, default: '' },
        required: false
    },
    keywords: { type: Array, default: [] },
    locals: { type: Array, default: [] },
    categories: { type: Array, default: [] },
});
