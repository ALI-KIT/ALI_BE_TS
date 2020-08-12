"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const mongoDB = process.env.MONGODB_URI || '';
mongoose_1.default.connect(mongoDB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
    .then(() => { })
    .catch(err => {
});
mongoose_1.default.Promise = global.Promise;
const db = mongoose_1.default.connection;
