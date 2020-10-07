import { Request, Response, Router } from 'express';
import unidecode from 'unidecode'
import { CrawlerManager } from '@crawler/base/CrawlerManager';
import { BaoMoiTinMoiCrawler } from '@crawler/impl/BaoMoiTinMoiCrawler';
import AppDatabase from '@daos/AppDatabase';
import { State } from '@crawler/base/Crawler';

const router = Router();

router.get('/', async (req: Request, res: Response, next) => {
    console.log("access control center")
    res.render('index', { title: 'Welcome to Ali Control Center' });
});

router.get('/pretty', async (req: Request, res: Response, next) => {
    //res.render('index', { title: 'Welcome to Ali Control Center' });
    res.render('control-center');
});

router.get('/crawler', async (req: Request, res: Response, next) => {
    const cmd = req.query["cmd"]?.toString() || ""
    const token = req.query["token"]?.toString() || ""

    var message = null
    if (token !== "1334557") message = "Wrong token, your token = " + token;

    if (!message) {
        switch (cmd) {
            case "101": {
                const manager: CrawlerManager = CrawlerManager.getInstance('app-crawler-manager');
                if (manager.status == State.RUNNING) {
                    message = "Crawler is already running."
                } else {
                    await manager.addNewCrawler(new BaoMoiTinMoiCrawler(1));
                    message = "Start crawler successfully";
                }
            }
                break;
            case "102": {
                const manager = CrawlerManager.findInstance("app-crawler-manager");
                if (manager && manager.status == State.RUNNING) {
                    manager.stop();
                    message = "Stop crawler sucessfully"
                } else {
                    message = "Crawler is not running. crawler status: " + ((manager) ? manager?.status : "  not existed");
                }
            }
                break
            case "103":
                const baseUrl = req.query["token"]?.toString() || ""
                const result = await AppDatabase.getInstance().news2Dao.findOne({ "source.baseUrl": baseUrl })
                message = result || "News not found "
                break;
            default:
                message = "Command not found";
        }
    }

    if (!message) {
        message = "No message was received";
    }

    try {
        res.status(200).send(message)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

export default router;