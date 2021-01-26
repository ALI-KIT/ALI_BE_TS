import { Reliable } from "@core/repository/base/Reliable";
import CrawlerDatabase from "@daos/CrawlerDatabase";
import { News } from "@entities/News2";
import { DocumentQuery } from "mongoose";

export class GetCrawlerNewsFeed {
    public async invoke(query = {}, sort = {}, limit = 0, skip = 0): Promise<Reliable<News[]>> {
        try {
            const news = await (await CrawlerDatabase.waitInstance()).news2Dao.model.find(query).limit(limit).sort(sort).skip(skip);
            return Reliable.Success(news || []);
        } catch (e) {
            return Reliable.Failed("Failed to get news", e);
        }
    }
}