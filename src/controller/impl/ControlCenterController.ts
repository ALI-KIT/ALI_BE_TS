import * as express from "express";
import { controller, interfaces, httpGet } from "inversify-express-utils";
import { stat } from 'fs';
import AppDatabase from '@daos/AppDatabase';
import { CrawlerManager } from '@crawler/base/CrawlerManager';
import { State } from '@crawler/base/Crawler';
import { BaoMoiTinMoiCrawler } from '@crawler/impl/BaoMoiTinMoiCrawler';
import { AliDbClient } from '@dbs/AliDbClient';
import { ObjectId } from 'mongodb'
import LoggingUtil from '@utils/LogUtil';
import { AppRunner } from "@scripts/schedule/AppRunner";

@controller("/control-center")
export class ControlCenterController implements interfaces.Controller {
    constructor(

    ) { }

    @httpGet('/')
    private async index(req: express.Request, res: express.Response, next: express.NextFunction) {
        return await this.stats(req, res, next);
    }

    @httpGet('/stats')
    private async stats(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            res.status(200).json({ message: "Success" });
        } catch (err) {
            res.status(400).json({ error: "err.message" });
        }
    }

    @httpGet('/crawler')
    private async startCrawlerIfAny(req: express.Request, res: express.Response, next: express.NextFunction) {
        AppRunner.getInstance().start()
            .catch(e => { AppRunner.getInstance().appAnalyzer = null });

        try {
            res.status(200).json(AppRunner.getInstance().getStatus());
        } catch (err) {
            res.status(400).json({ error: "err.message" });
        }
    }

    @httpGet('/crawler/stats')
    private async crawlerStats(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            res.status(200).json(AppRunner.getInstance().getStatus());
        } catch (err) {
            res.status(400).json({ error: "err.message" });
        }
    }

    @httpGet('/crawler/log')
    private async crawlerLog(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            res.status(200).send((LoggingUtil.getLogString() || "No log found.").replace(/\n/g, "<br />"));
        } catch (err) {
            res.status(400).json({ error: "err.message" });
        }
    }

    @httpGet('/cmd/:cmd')
    private async command(req: express.Request, res: express.Response, next: express.NextFunction) {
        const cmd = Number(req.params["cmd"]?.toString() || "0") || 0;
        const token = req.query["token"]?.toString() || ""
        var message = null
        if (token !== "dtrung-ntruong-1334557") message = "Wrong token, your token \"" + token + "\" is invalid or expired";

        if (!message) {
            switch (cmd) {
                case 101: {
                    const manager: CrawlerManager = CrawlerManager.getInstance('app-crawler-manager');
                    if (manager.status == State.RUNNING) {
                        message = "Crawler is already running."
                    } else {
                        await manager.addNewCrawler(new BaoMoiTinMoiCrawler(1));
                        message = "Start crawler successfully";
                    }
                }
                    break;
                case 102: {
                    const manager = CrawlerManager.findInstance("app-crawler-manager");
                    if (manager && manager.status == State.RUNNING) {
                        manager.stop();
                        message = "Stop crawler sucessfully"
                    } else {
                        message = "Crawler is not running. crawler status: " + ((manager) ? manager?.status : "  not existed");
                    }
                }
                    break
                case 103:
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
            LoggingUtil.consoleLog(error)
            res.status(500).send(error)
        }
    }
}