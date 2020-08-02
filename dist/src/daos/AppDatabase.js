"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NewsDao_1 = require("./News/NewsDao");
const News2Dao_1 = require("./News2/News2Dao");
const PlaceDao_1 = require("./PlaceDao");
class AppDatabase {
    constructor() {
        this.newsDao = new NewsDao_1.NewsDao();
        this.news2Dao = new News2Dao_1.NewsDao();
        this.placeDao = new PlaceDao_1.PlaceDao();
    }
    static getInstance() {
        if (!AppDatabase.instance) {
            AppDatabase.instance = new AppDatabase();
        }
        return AppDatabase.instance;
    }
}
exports.default = AppDatabase;
//# sourceMappingURL=AppDatabase.js.map