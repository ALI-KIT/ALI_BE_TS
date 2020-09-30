import * as express from "express";
import { controller, interfaces, httpGet } from "inversify-express-utils";
import { stat } from 'fs';
import AppDatabase from '@daos/AppDatabase';
import { CrawlerManager } from '@crawler/base/CrawlerManager';
import { State } from '@crawler/base/Crawler';
import { BaoMoiTinMoiCrawler } from '@crawler/impl/BaoMoiTinMoiCrawler';
import { AliDbClient } from '@dbs/AliDbClient';
import { ObjectId } from 'mongodb'

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
                        manager.addNewCrawler(new BaoMoiTinMoiCrawler(1));
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
                case 104:
                    {
                        const code = req.query["code"]?.toString() || "";
                        const locationDbs = (AliDbClient.getInstance().defaultClient) ? AliDbClient.getInstance().useLocals(AliDbClient.getInstance().defaultClient!) : null;
                        if (!locationDbs) {
                            message = "Db is not connected";
                            break;
                        }

                        const result = await (locationDbs.collection("tinh-thanh").find({ code: code })).toArray() || []
                        message = result;

                    }
                    break
                case 105:
                    {
                        const id = req.query["id"]?.toString() || ""
                        const aliDbs = (AliDbClient.getInstance().defaultClient) ? AliDbClient.getInstance().useALIDB(AliDbClient.getInstance().defaultClient!) : null;
                       
                        if (!aliDbs) {
                            message = "AliDbs is not connected";
                            break;
                        }

                        const result = await aliDbs.collection("news-2").findOne({ _id: new ObjectId(id) });
                        message = {
                            id: id,
                            result: result
                        };
                    }
                    break;
                case 106:
                    {
                        const locationDbs = (AliDbClient.getInstance().defaultClient) ? AliDbClient.getInstance().useLocals(AliDbClient.getInstance().defaultClient!) : null;
                        if (!locationDbs) {
                            message = "Db is not connected";
                            break;
                        }

                        const tinhThanh = await (locationDbs.collection("tinh-thanh").find({})).toArray();
                        const quanHuyen = await (locationDbs.collection("quan-huyen").find({})).toArray();
                        const xaPhuong = await (locationDbs.collection("xa-phuong").find({})).toArray();

                        const preResult = tinhThanh.concat(quanHuyen, xaPhuong);
                        const result = new Array();
                        preResult.forEach(t => {
                            const keywords = new Array<string>();
                            
                            if(t["name"]) keywords.push(t["name"]);
                            if(t["slug"]) keywords.push(t["slug"]);

                            result.push({
                                name: t["name"] || "",
                                type: t["type"] || "",
                                slug: t["slug"] || "",
                                name_with_type: t["name_with_type"] || "",
                                path: t["path"] || "",
                                path_with_type: t["path_with_type"] || "",
                                code: t["code"] || "",
                                parent_code: t["parent_code"] || "",
                                keywords: keywords
                            })
                        })
                      
                        break;
                    }
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
    }
}