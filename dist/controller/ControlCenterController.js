"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const CrawlerManager_1 = require("@crawler/base/CrawlerManager");
const BaoMoiTinMoiCrawler_1 = require("@crawler/impl/BaoMoiTinMoiCrawler");
const router = express_1.Router();
router.get('/', (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    res.render('index', { title: 'Welcome to Ali Control Center' });
}));
router.get('/pretty', (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    res.render('index', { title: 'Welcome to Ali Control Center' });
}));
router.get('/begin-crawler', (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const manager = new CrawlerManager_1.CrawlerManager('app-crawler-manager');
    manager.addNewCrawler(new BaoMoiTinMoiCrawler_1.BaoMoiTinMoiCrawler(1));
    try {
        res.status(200).send('Success');
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
exports.default = router;
