"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsSchema = void 0;
const domain_1 = require("domain");
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
    aggregator: { type: domain_1.Domain, required: false },
    source: { type: domain_1.Domain, required: false },
    keywords: { type: Array, default: [] },
    locals: { type: Array, default: [] },
    categories: { type: Array, default: [] },
});
//# sourceMappingURL=News2.js.map