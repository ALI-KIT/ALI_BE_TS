"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsDao = exports.PagingData = void 0;
const tslib_1 = require("tslib");
const News_1 = require("@entities/News");
const IDao_1 = require("@daos/IDao");
class PagingData {
    constructor(maxItem, maxPage) {
        this.maxItem = maxItem;
        this.maxPage = maxPage;
    }
}
exports.PagingData = PagingData;
class NewsDao extends IDao_1.IDao {
    constructor() {
        super('news', News_1.NewsSchema);
    }
    getAllPaging(limit, skip) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = this.model.find({}).skip(skip).limit(limit);
            return result;
        });
    }
    getMaxNewsAndMaxPage(limit) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const count = yield this.model.find({}).countDocuments().exec().catch(error => {
                return 0;
            });
            return new PagingData(count || 0, Math.ceil(count / limit));
        });
    }
    getMaxNewsAndMaxPageWithCondition(condition, limit) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const maxItem = yield this.model.find(condition).countDocuments();
            const maxPage = Math.ceil(maxItem / limit);
            return new PagingData(maxItem, maxPage);
        });
    }
    findAllWithCondition(condition, limit, skip) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (limit < 0 || skip < 0)
                return yield this.model.find(condition);
            else
                return yield this.model.find(condition).skip(skip).limit(limit);
        });
    }
}
exports.NewsDao = NewsDao;
