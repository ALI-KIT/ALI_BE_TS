"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const cheerio_1 = tslib_1.__importDefault(require("cheerio"));
class CrawlUtil {
    static loadWebsite(url) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default
                .get(url)
                .then(response => response.data)
                .catch(error => {
                error.status = (error.response && error.response.status) || 500;
                return null;
            });
        });
    }
    static loadWebsiteWithCheerIo(url) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default
                .get(url)
                .then(response => cheerio_1.default.load(response.data, { decodeEntities: false }))
                .catch(error => {
                error.status = (error.response && error.response.status) || 500;
                throw error;
            });
        });
    }
}
exports.default = CrawlUtil;
