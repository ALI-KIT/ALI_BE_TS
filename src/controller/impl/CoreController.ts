import * as express from "express";
import { interfaces, controller, httpGet, httpPost, httpDelete, request, queryParam, response, requestParam } from "inversify-express-utils";
import { injectable, inject } from "inversify";
import { GetInfo } from "@core/usecase/common/GetInfo";
import { GetLocationData } from "@core/usecase/common/GetLocationsData";
import { Reliable, Type } from "@core/repository/base/Reliable";
import { GetFullKeywordsData } from "@core/usecase/common/GetFullKeywordsData";
import { GetKeywordsData } from "@core/usecase/common/GetKeywordsData";

@controller("/")
export class CoreController implements interfaces.Controller {
    @httpGet('info')
    private async info(req: express.Request, res: express.Response, next: express.NextFunction) {
        await CoreController.sendJsonResponse(new GetInfo().invoke, res);
    }

    @httpGet('info/locations')
    private async locations(req: express.Request, res: express.Response, next: express.NextFunction) {
        await CoreController.sendJsonResponse(new GetLocationData().invoke, res);
    }

    @httpGet('info/keywords')
    private async infoKeywords(req: express.Request, res: express.Response, next: express.NextFunction) {
        await CoreController.sendJsonResponse(new GetKeywordsData().invoke, res);
    }

    @httpGet('info/fullkeywords')
    private async infoFullKeywords(req: express.Request, res: express.Response, next: express.NextFunction) {
        await CoreController.sendJsonResponse(new GetFullKeywordsData().invoke, res);
    }

    @httpPost('update/keywords')
    private async updateKeywords(req: express.Request, res: express.Response, next: express.NextFunction) {
    }

    @httpPost('deploy')
    private async deploy(req: express.Request, res: express.Response, next: express.NextFunction) {
        
    }

    static async sendJsonResponse(func: () => Promise<Reliable<any>>, res: express.Response) {
        try {
            const reliable = await func();
            if (reliable.type == Type.SUCCESS) {
                res.status(200).json(reliable.data);
            } else {
                res.status(500).json(reliable);
            }
        } catch (err) {
            res.status(500).json(Reliable.Failed(err.message, err));
        }
    }


}