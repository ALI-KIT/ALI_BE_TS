import express from "express";
import { inject } from "inversify";
import { controller, httpGet, httpPost, interfaces, results } from "inversify-express-utils";

@controller("/statistics")
export class StatisticsController implements interfaces.Controller {
  constructor() { }

  @httpGet('/map')
  private async dataMap(req: express.Request, res: express.Response, next: express.NextFunction) {
    const data = [
      {
        lat: 10.844790, 
        lng: 106.785770, 
        data:{
          name: "P. Hiệp Phú", 
          numOfArticles: 5,
          tag:"Hiep Phu"
        }
      },
      {
        lat: 10.865833, 
        lng: 106.8325, 
        data:{
          name: "P. Long Bình", 
          numOfArticles: 3,
          tag:"Long Binh"
        }
      },
      {
        lat: 10.843611, 
        lng: 106.791389, 
        data:{
          name: "P. Tăng Nhơn Phú A", 
          numOfArticles: 12,
          tag:"Tang Nhon Phu A"
        }
      },
      {
        lat: 10.861111, 
        lng: 106.798056, 
        data:{
          name: "P. Phước Long", 
          numOfArticles: 5,
          tag:"Phuoc Long"
        }
      }
    ];

    res.status(200).json(data);
  }
}