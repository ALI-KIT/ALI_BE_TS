import * as express from "express";
import { interfaces, controller, httpGet, httpPost, httpDelete, request, queryParam, response, requestParam } from "inversify-express-utils";
import { injectable, inject } from "inversify";
import { GetNewsFeed, Param } from '@core/usecase/common/GetNewsFeed';
import { TYPES_USECASES } from '@core/di/Types';
import { Reliable, Type } from '@core/repository/base/Reliable';
import { FeShortFeed } from '@entities/fe/FeFeed';
import { ConvertNewsToFeFeed, ConvertNewsToFeShortFeed, ConvertNewsToFeFeeds, ConvertNewsToFeShortFeeds } from '@core/usecase/common/ConvertNewsToFeFeed';
import { GetNewsDetail } from '@core/usecase/common/GetNewsDetail';
import { GetFeedsGroupBySimilarity, GetFeedsGroupBySimilarityParam } from '@core/usecase/common/GetFeedsGroupBySimilarity';
import { CoreUtil } from "@utils/CoreUtil";
import { getSimilarityById } from "@core/usecase/common/GetSimilarityById";
import { GetCrawlerNewsFeed } from "@core/usecase/common/GetCrawlerNewsFeed";
import { KeywordsUtil } from "@utils/KeywordsUtil";

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
    private getNewsDetail: GetNewsDetail,

    @inject(TYPES_USECASES.GetFeedsGroupBySimilarity)
    private getFeedsGroupBySimilarity: GetFeedsGroupBySimilarity) { }

  @httpGet('/')
  private async index(req: express.Request, res: express.Response, next: express.NextFunction) {
    return await this.feed(req, res, next);
  }

  @httpGet('/feed')
  private async feed(req: express.Request, res: express.Response, next: express.NextFunction) {
    const per_page = Math.max(Number(req.query["per_page"]?.toString()) || 40, 1);
    const page = Math.max(Number(req.query["page"]?.toString()) || 1, 1);
    const order_by = req.query["order_by"] as string || "trendingScore";
    const sort = req.query["sort"] as string || "desc";
    const query = req.query["query"] as string || undefined;

    const regex = query && KeywordsUtil.buildRegexString(Array(query));
    const queryArg = query ? {
      $or: [
        { title: { $regex: regex } },
        { summary: { $regex: regex } },
        { keywords: { $in: Array(query) } }
      ]
    } : {};

    const sortArg = {};

    sortArg[order_by] = (sort == "asc") ? 1 : -1;

    const limit = per_page;
    const skip = limit * (page - 1);
    const param = new Param(limit, skip, queryArg, sortArg);

    const reliablePre = await this.getNewsFeed.invoke(param);
    const reliable = (reliablePre.type == Type.FAILED) ? reliablePre : await this.convertNewsToFeShortFeeds.invoke(reliablePre.data || []);
    try {
      res.status(200).json(reliable.type == Type.SUCCESS ? reliable.data : { message: reliable.message, error: reliable.error });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Trả về object news chi tiết
   * @param req 
   * @param res 
   * @param next 
   */
  @httpGet('/detail/:id')
  private async detail(req: express.Request, res: express.Response, next: express.NextFunction) {
    const id = req.params["id"]?.toString() || "";

    const data = await this.getNewsDetail.invoke(id);
    const data2 = (data.type == Type.FAILED) ? data : await this.convertNewsToFeFeed.invoke(data.data!!);

    try {
      res.status(200).json(data2.type == Type.SUCCESS ? data2.data : { message: data2.message, error: data2.error });
    } catch (err) {
      res.status(400).json({ message: err.message, error: err });
    }
  }

  @httpGet('/feed/similarity')
  private async feedSimilarity(req: express.Request, res: express.Response, next: express.NextFunction) {
    return await this.getSimilarities(req, res, next);
  }

  @httpGet('/similarity')
  private async getSimilarities(req: express.Request, res: express.Response, next: express.NextFunction) {
    const per_page = Math.max(Number(req.query["per_page"]?.toString()) || 40, 1);
    const page = Math.max(Number(req.query["page"]?.toString()) || 1, 1);

    const limit = per_page;
    const skip = limit * (page - 1);


    const data = await this.getFeedsGroupBySimilarity.invoke(new GetFeedsGroupBySimilarityParam(skip, limit));
    try {
      res.status(200).json(data.type == Type.SUCCESS ? data.data : { message: data.message, error: data.error });
    } catch (err) {
      res.status(400).json({ message: err.message, error: err });
    }
  }

  @httpGet('/similarity/:id')
  private async getSimilarityById(req: express.Request, res: express.Response, next: express.NextFunction) {
    const id = req.params["id"]?.toString() || "";

    try {
      const reliable = await new getSimilarityById(id).invoke();
      if (reliable.type == Type.SUCCESS) {
        res.status(200).json(reliable.data);
      } else {
        res.status(500).json(reliable);
      }
    } catch (err) {
      res.status(500).json(Reliable.Failed(err.message, err));
    }
  }

  /**
   * This method provides a way to fetch news from "Crawler Database"
   */
  @httpGet('/pool')
  private async getCrawlerNews(req: express.Request, res: express.Response, next: express.NextFunction) {
    const per_page = Math.max(Number(req.query["per_page"]?.toString()) || 40, 1);
    const page = Math.max(Number(req.query["page"]?.toString()) || 1, 1);
    const order_by = req.query["order_by"] as string || "publicationDate";
    const sort = req.query["sort"] as string || "desc";

    const limit = per_page;
    const skip = limit * (page - 1);
    const sortArg = {};
    sortArg[order_by] = (sort == "asc") ? 1 : -1;

    try {
      const preReliable = await new GetCrawlerNewsFeed().invoke({}, order_by && sort && sortArg, limit, skip);
      const reliable = (preReliable.type == Type.FAILED) ? preReliable : await this.convertNewsToFeShortFeeds.invoke(preReliable.data!!);
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