import * as express from "express";
import { interfaces, controller, httpGet, httpPost, httpDelete, request, queryParam, response, requestParam } from "inversify-express-utils";
import { injectable, inject } from "inversify";
import { GetInfo } from "@core/usecase/common/GetInfo";
import { GetLocationData } from "@core/usecase/common/GetLocationsData";
import { Reliable, Type } from "@core/repository/base/Reliable";
import { GetFullKeywordsData } from "@core/usecase/common/GetFullKeywordsData";
import { GetKeywordsData } from "@core/usecase/common/GetKeywordsData";
import { CoreUtil } from "@utils/CoreUtil";
import { GetTrendsRating } from "@core/usecase/trending/GetTrendsRating";
import { SetKeywordsData } from "@core/usecase/common/SetKeywordsData";
import { SetLocationData } from "@core/usecase/common/SetLocationsData";

@controller("/")
export class CoreController implements interfaces.Controller {
    @httpGet('info')
    private async info(req: express.Request, res: express.Response, next: express.NextFunction) {
        await CoreUtil.sendJsonResponse(new GetInfo().invoke, res);
    }

    @httpGet('info/locations')
    private async locations(req: express.Request, res: express.Response, next: express.NextFunction) {
        await CoreUtil.sendJsonResponse(new GetLocationData().invoke, res);
    }

    @httpGet('info/keywords')
    private async infoKeywords(req: express.Request, res: express.Response, next: express.NextFunction) {
        await CoreUtil.sendJsonResponse(new GetKeywordsData().invoke, res);
    }

    @httpGet('info/fullkeywords')
    private async infoFullKeywords(req: express.Request, res: express.Response, next: express.NextFunction) {
        await CoreUtil.sendJsonResponse(new GetFullKeywordsData().invoke, res);
    }

    @httpPost('update/keywords')
    private async updateKeywords(req: express.Request, res: express.Response, next: express.NextFunction) {
        /* Haven't done yet */
        await CoreUtil.sendJsonResponse(() => new SetKeywordsData().invoke([...req.body]), res);
    }

    @httpPost('update/locations')
    private async updateLocations(req: express.Request, res: express.Response, next: express.NextFunction) {
        /* Haven't done yet */
        await CoreUtil.sendJsonResponse(() => new SetLocationData().invoke([...req.body]), res);
    }


    @httpGet('trends/rating')
    private async getTrendsRating(req: express.Request, res: express.Response, next: express.NextFunction) {
        await CoreUtil.sendJsonResponse(() => new GetTrendsRating().invoke(), res);
    }

}