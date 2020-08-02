"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsDao = void 0;
const tslib_1 = require("tslib");
const News2_1 = require("@entities/News2");
const IDao_1 = require("@daos/IDao");
class NewsDao extends IDao_1.IDao {
    constructor() {
        super('news', News2_1.NewsSchema);
    }
    create(item) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.model.create(item);
                return data;
            }
            catch (error) {
                return error;
            }
        });
    }
    getAllPaging(limit, skip) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = this.model.find({}).skip(skip).limit(limit);
            return result;
        });
    }
}
exports.NewsDao = NewsDao;
//# sourceMappingURL=News2Dao.js.map