import { Reliable } from "@core/repository/base/Reliable";
import AppDatabase from "@daos/AppDatabase";
import CrawlerDatabase from "@daos/CrawlerDatabase";
import { DbScript } from "@scripts/DbScript";

export class LimitCrawlerDocument extends DbScript<any> {
    public static readonly MAX = 45000;
    protected async runInternal(): Promise<Reliable<any>> {
        const count = await CrawlerDatabase.getInstance().news2Dao.model.countDocuments();
        var after = count;
        if (count > LimitCrawlerDocument.MAX) {
            const deleted = count - LimitCrawlerDocument.MAX;

            const ids = (await CrawlerDatabase.getInstance()
                .news2Dao
                .model
                .find({})
                .limit(deleted)
                .sort({ publicationDate: 1 })).map(doc => doc._id);

            const result = await CrawlerDatabase.getInstance().news2Dao.model.remove({ _id: { $in: ids } })
            return Reliable.Success(result);
        }

        return Reliable.Success("LimitCrawlerDocument: Count = " + count + " < " + LimitCrawlerDocument.MAX);
    }

}

export class LimitBackendDocument extends DbScript<any> {
    public static readonly MAX = 45000;
    protected async runInternal(): Promise<Reliable<any>> {
        const count = await AppDatabase.getInstance().news2Dao.model.countDocuments();
        var after = count;
        if (count > LimitCrawlerDocument.MAX) {
            const deleted = count - LimitCrawlerDocument.MAX;

            const ids = (await AppDatabase.getInstance()
                .news2Dao
                .model
                .find({})
                .limit(deleted)
                .sort({ publicationDate: 1 })).map(doc => doc._id);

            const result = await AppDatabase.getInstance().news2Dao.model.remove({ _id: { $in: ids } })
            return Reliable.Success(result);
        }

        return Reliable.Success("LimitBackendDocument: Count = " + count + " < " + LimitCrawlerDocument.MAX);
    }

}