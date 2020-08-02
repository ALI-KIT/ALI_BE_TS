"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDao = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = require("mongoose");
class IDao {
    constructor(collectionName, schema) {
        this.model = mongoose_1.model(collectionName, schema);
    }
    findById(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(id);
        });
    }
    findOne(condition) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne(condition);
        });
    }
    findAll(condition) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield this.model.find(condition)) || [];
        });
    }
    getAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.model.find({});
        });
    }
}
exports.IDao = IDao;
//# sourceMappingURL=IDao.js.map