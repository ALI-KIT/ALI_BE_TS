"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerManager = exports.RepeatMode = void 0;
const tslib_1 = require("tslib");
const Crawler_1 = require("@crawler/base/Crawler");
const p_queue_1 = tslib_1.__importDefault(require("p-queue"));
var RepeatMode;
(function (RepeatMode) {
    RepeatMode[RepeatMode["ONCE_TIME"] = 0] = "ONCE_TIME";
    RepeatMode[RepeatMode["IMMEDIATELY_AFTER"] = 1] = "IMMEDIATELY_AFTER";
    RepeatMode[RepeatMode["PER_HOUR"] = 2] = "PER_HOUR";
    RepeatMode[RepeatMode["PER_HALF_HOUR"] = 3] = "PER_HALF_HOUR";
    RepeatMode[RepeatMode["PER_SIX_HOUR"] = 4] = "PER_SIX_HOUR";
    RepeatMode[RepeatMode["DAILY"] = 5] = "DAILY";
})(RepeatMode = exports.RepeatMode || (exports.RepeatMode = {}));
class CrawlerManager {
    constructor(name, session) {
        this.id = CrawlerManager.generateId();
        this.crawlingList = [];
        this.crawlUrlList = [];
        this.repeatMode = RepeatMode.IMMEDIATELY_AFTER;
        this.timeout = CrawlerManager.TIMEOUT_ENDLESS;
        this.startTime = Date.now();
        this.endTime = 0;
        this.status = Crawler_1.State.PENDING;
        this.result = [];
        this.name = name || this.startTime.toString();
        this.currentSession = session || this.startTime.toString();
        this.promiseQueue = new p_queue_1.default({ concurrency: 100 });
        this.promiseQueue.on('idle', () => {
            console.log(`Queue is idle.  Size: ${this.promiseQueue.size}  Pending: ${this.promiseQueue.pending}`);
        });
    }
    static generateId() { return this._count++; }
    addNewCrawler(crawler) {
        if (this.crawlUrlList.indexOf(crawler.url) > -1) {
            console.log('duplicated url: ' + crawler.url);
        }
        else {
            this.crawlUrlList.push(crawler.url);
            this.crawlingList.push(crawler);
            this.addToQueue(crawler.id, crawler.priority);
        }
    }
    findCrawlerByUrl(url, name = '') {
        return null;
    }
    addCrawlerByUrl(priority, url, name = '') {
        const crawler = this.findCrawlerByUrl(url, name);
        if (crawler)
            crawler.priority = priority;
        if (crawler)
            this.addNewCrawler(crawler);
    }
    findCrawlerById(id) {
        return this.crawlingList.find((crawler) => crawler.id === id) || null;
    }
    addToQueue(crawlerId, priority) {
        this.promiseQueue.add(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const crawler = this.findCrawlerById(crawlerId);
            if (!crawler)
                return;
            crawler.manager = this;
            crawler.state = Crawler_1.State.STARTING;
            crawler.state = Crawler_1.State.RUNNING;
            const url = crawler.url;
            let error = '';
            const html = yield crawler.loadHtml(url);
            let result;
            if (!html)
                error = 'crawler ' + crawler.name + ' ' + crawler.id + ' getting html failed with url ' + crawler.url;
            else if (error === '') {
                result = yield crawler.parseHtml(html);
                if (!result)
                    error = 'crawler ' + crawler.name + ' ' + crawler.id + ' failed to parsing html with url ' + crawler.url;
            }
            if (error === '') {
                const saveR = yield crawler.saveResult(result);
                this.onCrawlerResult(result);
                if (saveR && saveR !== '')
                    error = saveR;
            }
            if (error === '')
                crawler.state = Crawler_1.State.FINISHED;
            else {
                crawler.state = Crawler_1.State.FAILED;
                console.log(error);
            }
            crawler.manager = null;
            const currentPosition = this.crawlingList.indexOf(crawler);
            if (currentPosition >= -1)
                this.crawlingList.splice(currentPosition, 1);
        }), { priority });
    }
    onCrawlerResult(result) {
    }
    start() {
    }
    cancel() {
    }
    pause() {
    }
    resume() {
    }
}
exports.CrawlerManager = CrawlerManager;
CrawlerManager.TIMEOUT_ENDLESS = -1;
CrawlerManager._count = 1;
