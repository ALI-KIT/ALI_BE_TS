"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crawler = exports.State = void 0;
const tslib_1 = require("tslib");
const CrawlerManager_1 = require("@crawler/base/CrawlerManager");
const crawlUtils_1 = tslib_1.__importDefault(require("@utils/crawlUtils"));
var State;
(function (State) {
    State[State["PENDING"] = 0] = "PENDING";
    State[State["STARTING"] = 1] = "STARTING";
    State[State["RUNNING"] = 2] = "RUNNING";
    State[State["PAUSED"] = 3] = "PAUSED";
    State[State["CANCELLED"] = 4] = "CANCELLED";
    State[State["FINISHED"] = 5] = "FINISHED";
    State[State["FAILED"] = 6] = "FAILED";
})(State = exports.State || (exports.State = {}));
class Crawler {
    constructor(url, piority = 5, manager) {
        this.id = CrawlerManager_1.CrawlerManager.generateId();
        this.name = this.getName();
        this.displayName = this.getName();
        this.baseUrl = this.getBaseUrl();
        this.priority = 5;
        this.startTime = Date.now();
        this.endTime = 0;
        this._state = State.PENDING;
        this.url = url;
        this.manager = manager || null;
        this.priority = piority;
    }
    get manager() { return this._manager || null; }
    set manager(value) {
        this._manager = value || undefined;
    }
    get state() { return this._state; }
    set state(value) {
        if (value !== this._state) {
            const old = this._state;
            this._state = value;
            this.notifyStateChanged(old, value);
        }
    }
    notifyStateChanged(oldState, newState) {
    }
    execute() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const url = this.url;
            const html = yield this.loadHtml(url);
            const result = html ? yield this.parseHtml(html) : null;
            return result;
        });
    }
    loadHtml(url) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield crawlUtils_1.default.loadWebsite(url);
        });
    }
}
exports.Crawler = Crawler;
