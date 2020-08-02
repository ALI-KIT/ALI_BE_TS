"use strict";
var express = require('express');
var router = express.Router();
var controlCenterController = require('../controllers/controlCenterController');
router.get('/', controlCenterController.home);
router.get('/pretty', controlCenterController.pretty);
router.get('/status', controlCenterController.home);
router.get('/begin-crawl', controlCenterController.beginCrawl);
router.get('/begin-crawl-2', controlCenterController.beginCrawl2);
module.exports = router;
//# sourceMappingURL=ControlCenter.js.map