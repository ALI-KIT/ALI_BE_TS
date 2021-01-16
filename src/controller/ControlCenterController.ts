import { Request, Response, Router } from 'express';
import unidecode from 'unidecode'
import { CrawlerManager } from '@crawler/base/CrawlerManager';
import { BaoMoiTinMoiCrawler } from '@crawler/impl/BaoMoiTinMoiCrawler';
import AppDatabase from '@daos/AppDatabase';
import { State } from '@crawler/base/Crawler';
import LoggingUtil from '@utils/LogUtil';

const router = Router();

router.get('/', async (req: Request, res: Response, next) => {
    LoggingUtil.consoleLog("access control center");
    res.render('index', { title: 'Welcome to Ali Control Center' });
});

router.get('/pretty', async (req: Request, res: Response, next) => {
    //res.render('index', { title: 'Welcome to Ali Control Center' });
    res.render('control-center');
});

export default router;