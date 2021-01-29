import { Reliable } from "@core/repository/base/Reliable";
import AppDatabase from "@daos/AppDatabase";
import { MongoDbBackendClient } from "@daos/MongoDbBackendClient";
import { TrendsRating } from "@entities/TrendsRating";

export class GetTrendsRating {
    public async invoke(): Promise<Reliable<TrendsRating>> {
        try {
            const trendsRating = await (await AppDatabase.waitInstance()).trendsRatingDao.findOne({ "name": "trends-rating" });
            /* if (!trendsRating.data) {
                return Reliable.Failed("trends-rating is not found");
            } */
            if (trendsRating) {
                return Reliable.Success({ data: (trendsRating.data || []).map(item => { return { count: item.count, status: item.status, text: item.text } }), name: trendsRating.name, total: trendsRating.total, updatedAt: trendsRating.updatedAt } as TrendsRating)
            }
            return Reliable.Success(trendsRating);
        } catch (e) {
            return Reliable.Failed("Couldn't get trends-rating", e);
        }

    }
}