import { Request, Response, Router } from 'express';
import unidecode from 'unidecode'  
import { CrawlerManager } from '@crawler/base/CrawlerManager';
import { BaoMoiTinMoiCrawler } from '@crawler/impl/BaoMoiTinMoiCrawler';

const router = Router();

router.get('/', async (req: Request, res: Response, next) => {
    res.render('index', { title: 'Welcome to Ali Control Center' });
});

router.get('/pretty', async (req: Request, res: Response, next) => {
    res.render('index', { title: 'Welcome to Ali Control Center' });
});

router.get('/begin-crawler', async (req: Request, res: Response, next) => {
    const manager: CrawlerManager = new CrawlerManager('app-crawler-manager');
    manager.addNewCrawler(new BaoMoiTinMoiCrawler(1))

    try {
        res.status(200).send('Success')
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

export default router;