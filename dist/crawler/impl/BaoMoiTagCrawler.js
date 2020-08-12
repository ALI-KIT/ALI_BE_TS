"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaoMoiTagCrawler = void 0;
const tslib_1 = require("tslib");
const NewsCrawler_1 = require("@crawler/base/NewsCrawler");
const cheerio_1 = tslib_1.__importDefault(require("cheerio"));
const BaoMoiXemTinCrawler_1 = require("@crawler/impl/BaoMoiXemTinCrawler");
class BaoMoiTagCrawler extends NewsCrawler_1.NewsCrawler {
    constructor(tag, prettyUrl, page, piority = 5) {
        super(BaoMoiTagCrawler.getBMTagUrl(prettyUrl, page), piority);
        this.page = page;
        this.prettyUrl = prettyUrl;
        this.tag = tag;
    }
    static getBMTagUrl(prettyUrl, page) {
        const match = this.tagRegex.exec(prettyUrl);
        if (match && match.length > 1) {
            return 'https://baomoi.com/tag/' + match[1] + '/trang' + page + '.epi?loadmore=1';
        }
        return '';
    }
    getName() {
        return 'bao-moi-tin-moi';
    }
    getDisplayName() {
        return 'Báo mới - Tin mới';
    }
    getBaseUrl() {
        return 'https://baomoi.com';
    }
    parseHtml(html) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const $ = cheerio_1.default.load(html, { decodeEntities: false });
            const items = [];
            $('div.story:not(.story--video,.story--photo,.wait-render) a.cache').each((i, e) => {
                items.push(this.baseUrl + $(e).attr('href'));
            });
            items.forEach((value) => { var _a; return (_a = this.manager) === null || _a === void 0 ? void 0 : _a.addNewCrawler(new BaoMoiXemTinCrawler_1.BaoMoiXemTinCrawler(value, this.priority - 1)); });
            console.log('tin-moi-bao-moi found ' + items.length + ' new news');
            if (items.length !== 0) {
                console.log('found new tag page: ' + (this.page++) + ' for tag [' + this.tag + ']');
                (_a = this.manager) === null || _a === void 0 ? void 0 : _a.addNewCrawler(new BaoMoiTagCrawler(this.tag, this.prettyUrl, this.page++, this.priority - 1));
            }
            return null;
        });
    }
}
exports.BaoMoiTagCrawler = BaoMoiTagCrawler;
BaoMoiTagCrawler.tagRegex = /(?<=\/tag\/)(.*)(?=.epi)/;
