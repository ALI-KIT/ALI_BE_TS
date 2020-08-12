"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaoMoiXemTinCrawler = void 0;
const tslib_1 = require("tslib");
const NewsCrawler_1 = require("@crawler/base/NewsCrawler");
const cheerio_1 = tslib_1.__importDefault(require("cheerio"));
const BaoMoiTagCrawler_1 = require("@crawler/impl/BaoMoiTagCrawler");
class BaoMoiXemTinCrawler extends NewsCrawler_1.NewsCrawler {
    getName() {
        return 'bao-moi-xem-tin';
    }
    getDisplayName() {
        return 'Báo mới - Xem tin';
    }
    getBaseUrl() {
        return 'https://baomoi.com';
    }
    parseHtml(html) {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const $ = cheerio_1.default.load(html, { decodeEntities: false });
            const title = $('h1.article__header').text();
            const summary = $('div.article__sapo').text();
            const content = $('div.article__body').html() || '';
            const aggregator = {
                name: 'baomoi',
                baseUrl: this.getBaseUrl(),
                displayName: 'Báo mới',
                url: this.url
            };
            const source = {
                name: '',
                baseUrl: '',
                displayName: ((_c = (_b = (_a = $('div.article a.source')) === null || _a === void 0 ? void 0 : _a.first()) === null || _b === void 0 ? void 0 : _b.text()) === null || _c === void 0 ? void 0 : _c.trim()) || '',
                url: $('p.bm-source a').attr('href') || ''
            };
            const thumbnail = $('div.article p.body-image img').first().attr('src') || '';
            const crawlDate = Date.now();
            const pDString = $('div.article__meta time').attr('datetime');
            const publicationDate = pDString ? new Date(pDString) : Date.now();
            const categories = $('div.breadcrumb a.cate').toArray().map(element => $(element).text().trim());
            const tagArray = $('div .keyword').toArray();
            const keywords = tagArray.map(element => $(element).text().trim());
            const tagUrlArray = tagArray.map(element => this.baseUrl + $(element).attr('href') || '');
            const locals = [];
            console.log('finish getting news: ' + title);
            if (tagUrlArray && tagUrlArray.length !== 0)
                tagUrlArray.forEach((value, index) => {
                    var _a;
                    console.log('xem tin found new tag url [' + value + ']');
                    (_a = this.manager) === null || _a === void 0 ? void 0 : _a.addNewCrawler(new BaoMoiTagCrawler_1.BaoMoiTagCrawler(keywords[index], value, 1, this.priority - 2));
                });
            return {
                title,
                summary,
                content,
                thumbnail,
                crawlDate,
                publicationDate,
                aggregator,
                source,
                keywords,
                categories,
                locals
            };
        });
    }
}
exports.BaoMoiXemTinCrawler = BaoMoiXemTinCrawler;
