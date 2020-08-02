"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
var router = express_1.default.Router();
const NewsController_1 = tslib_1.__importDefault(require("../controller/NewsController"));
router.use('/news', NewsController_1.default.router);
module.exports = router;
//# sourceMappingURL=Api.js.map