"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceSchema = void 0;
const mongoose_1 = require("mongoose");
exports.PlaceSchema = new mongoose_1.Schema({
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
