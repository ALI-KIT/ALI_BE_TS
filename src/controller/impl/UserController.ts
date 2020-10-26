import * as express from "express";
import { interfaces, controller, httpGet, httpPost, httpDelete, request, queryParam, response, requestParam } from "inversify-express-utils";
import { injectable, inject } from "inversify";
import { GetNewsFeed } from '@core/usecase/common/GetNewsFeed';
import { TYPES_USECASES } from '@core/di/Types';
import { ConvertNewsToFeFeed, ConvertNewsToFeShortFeed, ConvertNewsToFeFeeds, ConvertNewsToFeShortFeeds } from '@core/usecase/common/ConvertNewsToFeFeed';
import { GetNewsDetail } from '@core/usecase/common/GetNewsDetail';

@controller("/auth")
export class NewsController implements interfaces.Controller {
  constructor(
    @inject(TYPES_USECASES.GetNewsDetail)
    private getNewsDetail: GetNewsDetail) { }

  @httpPost('/register')
  private async register(req: express.Request, res: express.Response, next: express.NextFunction) {
  }

  @httpPost('/login')
  private async login(req: express.Request, res: express.Response, next: express.NextFunction) {
  }

  @httpPost('/logout')
  private async logout(req: express.Request, res: express.Response, next: express.NextFunction) {
  }

 }