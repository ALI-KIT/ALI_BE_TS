"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsDao = void 0;
const tslib_1 = require("tslib");
const News2_1 = require("@entities/News2");
const IDao_1 = require("@daos/IDao");
class NewsDao extends IDao_1.IDao {
    constructor() {
        super('news-2', News2_1.NewsSchema);
    }
    getAllPaging(limit, skip) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = this.model.find({}).skip(skip).limit(limit);
            return result;
        });
    }
}
exports.NewsDao = NewsDao;
