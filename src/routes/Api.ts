var express = require('express');
var router = express.Router();
import {} from '@controller'
var localController = require('../controllers/localController');

/* GET home page. */
// router.use(TokenCheckMiddleware)

router.use('/news', )

router.get('/local', localController.home)

module.exports = router;