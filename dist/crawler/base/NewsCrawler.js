"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsCrawler = void 0;
const tslib_1 = require("tslib");
const Crawler_1 = require("@crawler/base/Crawler");
const AppDatabase_1 = tslib_1.__importDefault(require("@daos/AppDatabase"));
class NewsCrawler extends Crawler_1.Crawler {
    saveResult(result) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const exist = yield AppDatabase_1.default.getInstance().news2Dao.findOne({ thumbnail: result.thumbnail });
            if (exist)
                return 'existed in database';
            else if (result)
                AppDatabase_1.default.getInstance().news2Dao.create(result);
            return '';
        });
    }
}
exports.NewsCrawler = NewsCrawler;
