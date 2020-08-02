"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceDao = void 0;
const tslib_1 = require("tslib");
const Place_1 = require("@entities/Place");
const IDao_1 = require("./IDao");
class PlaceDao extends IDao_1.IDao {
    constructor() {
        super("place", Place_1.PlaceSchema);
    }
    create(item) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.model.create(item);
                return data;
            }
            catch (error) {
                return error;
            }
        });
    }
}
exports.PlaceDao = PlaceDao;
//# sourceMappingURL=PlaceDao.js.map