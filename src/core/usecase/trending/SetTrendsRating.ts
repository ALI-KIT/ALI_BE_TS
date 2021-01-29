import { Reliable } from "@core/repository/base/Reliable";
import AppDatabase from "@daos/AppDatabase";
import { TrendsRating } from "@entities/TrendsRating";

export class SetTrendsRating {
    public async invoke(trendsRating: TrendsRating): Promise<Reliable<any>> {
        if (!trendsRating) {
            return Reliable.Failed("TrendsRating must not be null");
        }
        try {
            const result = await (await AppDatabase.waitInstance()).trendsRatingDao.model.findOneAndUpdate(
                { 'name': 'trends-rating' },
                { $set: {name:trendsRating.name, total: trendsRating.total, data: trendsRating.data, updatedAt: trendsRating.updatedAt } },
              /*   trendsRating, */
                { upsert: true, useFindAndModify: false })
            return Reliable.Success(result);
        } catch (e) {
            return Reliable.Failed("Failed to set trends-rating", e);
        }
    }
}