import * as express from "express";
import { controller, interfaces, httpGet } from "inversify-express-utils";

import LoggingUtil from '@utils/LogUtil';
import { AppRemoteRunner } from "@scripts/schedule/AppRemoteRunner";

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
        AppRemoteRunner.getInstance().start()
            .catch(e => { AppRemoteRunner.getInstance().appAnalyzer = null });

        try {
            res.status(200).json(AppRemoteRunner.getInstance().getStatus());
        } catch (err) {
            res.status(400).json({ error: "err.message" });
        }
    }

    @httpGet('/crawler/stats')
    private async crawlerStats(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            res.status(200).json(AppRemoteRunner.getInstance().getStatus());
        } catch (err) {
            res.status(400).json({ error: "err.message" });
        }
    }

    @httpGet('/crawler/log')
    private async crawlerLog(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let log : string = LoggingUtil.getLogString();
            if(!log || log=="") {
                log = "No log found.";
            }
            log = log.replace(/\n/g, "<br />");
            res.status(200).send(log);
        } catch (err) {
            res.status(400).json({ error: "err.message" });
        }
    }

    @httpGet('/crawler/stop')
    private async crawlerStop(req: express.Request, res: express.Response, next: express.NextFunction) {
        AppRemoteRunner.getInstance().stop()
        return await this.crawlerStats(req, res, next);
    }
}