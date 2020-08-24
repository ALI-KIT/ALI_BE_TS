import * as express from "express";
import { interfaces, controller, httpGet, httpPost, httpDelete, request, queryParam, response, requestParam } from "inversify-express-utils";
import { injectable, inject } from "inversify";
import { GetNewsFeed } from '@core/usecase/common/GetNewsFeed';
import { TYPES_USECASES } from '@core/di/Types';
import { Reliable, Type } from '@core/repository/base/Reliable';

@controller("/news")
export class NewsController implements interfaces.Controller {
  constructor(
    @inject(TYPES_USECASES.GetNewsFeed) 
    private getNewsFeed: GetNewsFeed)
    {}

    @httpGet('/')
    private async index(req: express.Request, res: express.Response, next: express.NextFunction) {
      const result = await this.getNewsFeed.invoke("Trung");
      const data = (result.type == Type.SUCCESS) ? result.data : result.message;
      try {
          res.status(200).json(data);
      } catch (err) {
          res.status(400).json({ error: err.message });
      }
  }

}