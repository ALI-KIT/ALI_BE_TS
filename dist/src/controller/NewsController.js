"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const unidecode_1 = tslib_1.__importDefault(require("unidecode"));
const AppDatabase_1 = tslib_1.__importDefault(require("../daos/AppDatabase"));
const newsDao = AppDatabase_1.default.getInstance().newsDao;
const placeDao = AppDatabase_1.default.getInstance().placeDao;
const router = express_1.Router();
router.get('/', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { page, per_page, location } = req.query;
    const loc = unidecode_1.default((location === null || location === void 0 ? void 0 : location.toString()) || "all").trim().toLowerCase();
    const limit = Number(per_page || 21);
    const skip = limit * ((Number(page || 1) > 1) ? (Number(page || 1) - 1) : 0);
    try {
        if (loc == "all") {
            const [data, header] = yield Promise.all([newsDao.getAllPaging(limit, skip), newsDao.getMaxNewsAndMaxPage(limit)]);
            res.status(200).header(header).json(data);
        }
        else {
            const place = yield placeDao.findOne({ "name": loc });
            if (place != null) {
                const { regex, flat } = place;
                const pattern = RegExp(regex, flat);
                const condition = {
                    $or: [
                        { "title": { $regex: pattern } },
                        { "summary": { $regex: pattern } },
                        { "content": { $regex: pattern } },
                        { "category": { $regex: pattern } }
                    ]
                };
                const [data, header] = yield Promise.all([newsDao.findAllWithCondition(condition, limit, skip), newsDao.getMaxNewsAndMaxPageWithCondition(condition, limit)]);
                res.status(200).header(header).json(data);
            }
            else {
                let result = { error: "¯\_(ツ)_/¯" };
                res.status(500).send(result);
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
router.get('/content/:id', (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const id = unidecode_1.default(req.params.id).trim().toLowerCase() || "null";
    try {
        const data = (yield newsDao.findById(id)) || { error: "¯\_(ツ)_/¯" };
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).send({ error: "¯\_(ツ)_/¯" });
    }
}));
router.get('/quan9', (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const id = '5f0ae0263a55493258285092';
        const np = yield Promise.all([newsDao.findAll({}), placeDao.findById(id)]);
        const regex = ((_a = np[1]) === null || _a === void 0 ? void 0 : _a.regex) || '';
        const flat = (_b = np[1]) === null || _b === void 0 ? void 0 : _b.flat;
        var result = np[0].filter(e => IsCorrectCondition(e, RegExp(regex, flat)));
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
router.get('/regex', (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const id = '5f0ae0263a55493258285092';
    try {
        const data = yield placeDao.findById(id);
        res.status(200).json(data);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
const IsCorrectCondition = (obj, regex) => {
    for (const e in obj) {
        if (regex.test(obj.title)
            || regex.test(obj.summary)
            || regex.test(obj.content))
            return true;
    }
    return false;
};
exports.default = {
    router
};
//# sourceMappingURL=NewsController.js.map