import { Reliable, Type } from "@core/repository/base/Reliable";
import { FindTrends } from "@core/usecase/trending/FindTrends";
import { GetTrendsRating } from "@core/usecase/trending/GetTrendsRating";
import { SetTrendsRating } from "@core/usecase/trending/SetTrendsRating";
import AppDatabase from "@daos/AppDatabase";
import { MongoDbBackendClient } from "@daos/MongoDbBackendClient";
import { TrendsRating } from "@entities/TrendsRating";
import { DbScript } from "@scripts/DbScript";
import { AppDbLogging } from "@utils/AppDbLogging";
import { CreateQuery } from "mongoose";

export class TrendsRatingAnalyzer extends DbScript<any> {
    protected async runInternal(): Promise<Reliable<any>> {
        const trends = await new FindTrends().invoke();

        if (trends.type == Type.FAILED || !trends) {
            return trends;
        }

        /*

        {
            total: number,
            data: [
                {
                    text: string,
                    count: number,
                    status: -1, 0, 1 (down, nochanges, up) 
                }
            ]
        }


        */

        const oldTrendsRating = await new GetTrendsRating().invoke();
        if (oldTrendsRating.type == Type.FAILED || !oldTrendsRating.data) {
            // no previous trends rating found
        };

        /*   const newTrendsRating: CreateQuery<TrendsRating> = {
              total: 0,
              data: [],
              updatedAt: new Date(Date.now())
          }; */

        const newTrendsRating = new (await AppDatabase.waitInstance()).trendsRatingDao.model({
            total: 0,
            data: [],
            updatedAt: new Date(Date.now())
        });

        const newTrends = trends.data;
        let total = 0;
        for (let i = 0; i < newTrends.length; i++) {
            const trend = newTrends[i];
            let status = 0;
            if (!oldTrendsRating.data) {
                status = 0;
            } else {
                const prevTrendIndex = oldTrendsRating.data.data.findIndex(item => (item.text == trend.text));
                if (prevTrendIndex == -1) {
                    status = 0;
                } else if (prevTrendIndex < i) {
                    status = -1;
                } else if (prevTrendIndex == i) {
                    // keeping previous index
                    const prevStatus = oldTrendsRating.data.data[prevTrendIndex].status;
                    status = /* prevStatus == 0 ? 1 : */ prevStatus;
                } else {
                    status = 1;
                }
            }
            total += trend.count;
            newTrendsRating.data.push({ text: trend.text, count: trend.count, status: status })
        }

        newTrendsRating.total = total;
        const result = await new SetTrendsRating().invoke(newTrendsRating);

        return result;
    }

}