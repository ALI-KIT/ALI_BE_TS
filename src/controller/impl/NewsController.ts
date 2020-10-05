import * as express from "express";
import { interfaces, controller, httpGet, httpPost, httpDelete, request, queryParam, response, requestParam } from "inversify-express-utils";
import { injectable, inject } from "inversify";
import { GetNewsFeed } from '@core/usecase/common/GetNewsFeed';
import { TYPES_USECASES } from '@core/di/Types';
import { Reliable, Type } from '@core/repository/base/Reliable';
import { FeShortFeed } from '@entities/fe/FeFeed';
import { ConvertNewsToFeFeed, ConvertNewsToFeShortFeed, ConvertNewsToFeFeeds, ConvertNewsToFeShortFeeds } from '@core/usecase/common/ConvertNewsToFeFeed';
import { GetNewsDetail } from '@core/usecase/common/GetNewsDetail';

@controller("/news")
export class NewsController implements interfaces.Controller {
  constructor(
    @inject(TYPES_USECASES.GetNewsFeed)
    private getNewsFeed: GetNewsFeed,

    @inject(TYPES_USECASES.ConvertNewsToFeFeed)
    private convertNewsToFeFeed: ConvertNewsToFeFeed,

    @inject(TYPES_USECASES.ConvertNewsToFeShortFeed)
    private convertNewsToFeShortFeed: ConvertNewsToFeShortFeed,

    @inject(TYPES_USECASES.ConvertNewsToFeFeeds)
    private convertNewsToFeFeeds: ConvertNewsToFeFeeds,

    @inject(TYPES_USECASES.ConvertNewsToFeShortFeeds)
    private convertNewsToFeShortFeeds: ConvertNewsToFeShortFeeds,

    @inject(TYPES_USECASES.GetNewsDetail)
    private getNewsDetail: GetNewsDetail) { }

  @httpGet('/')
  private async index(req: express.Request, res: express.Response, next: express.NextFunction) {
    return await this.feed(req, res, next);
  }

  @httpGet('/feed')
  private async feed(req: express.Request, res: express.Response, next: express.NextFunction) {
    const per_page = Math.max(Number(req.query["per_page"]?.toString()) || 40, 1);
    const page = Math.max(Number(req.query["page"]?.toString()) || 1, 1);

    const limit = per_page;
    const skip = limit * (page - 1);

    const locationQuery = req.query["location"] || [];
    const codeQuery = req.query["keyword"] || [];

    const locationCodes: string[] = Array.isArray(locationQuery) ? locationQuery as string[] : [locationQuery.toString()];
    const keywords : string[] = Array.isArray(codeQuery) ? codeQuery as string[] : [codeQuery.toString()];
    const len = keywords.length;

    const data = await this.getNewsFeed.invoke({ locationCodes, keywords, limit, skip });
    const data2 = (data.type == Type.FAILED) ? data : await this.convertNewsToFeShortFeeds.invoke(data.data || []);
    try {
      res.status(200).json(data2.type == Type.SUCCESS ? data2.data : { message: data2.message, error: data2.error });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  @httpGet('/detail/:id')
  private async detail(req: express.Request, res: express.Response, next: express.NextFunction) {
    const id = req.params["id"]?.toString() || "";

    const data = await this.getNewsDetail.invoke(id);
    const data2 = (data.type == Type.FAILED) ? data : await this.convertNewsToFeFeed.invoke(data.data!!);

    try {
      res.status(200).json(data2.type == Type.SUCCESS ? data2.data : { message: data2.message, error: data2.error });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}