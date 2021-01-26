import { Reliable } from "@core/repository/base/Reliable";
import AppDatabase from "@daos/AppDatabase";
import CrawlerDatabase from "@daos/CrawlerDatabase";
import { News } from "@entities/News2";
import { DbScript } from "@scripts/DbScript";
import LoggingUtil from "@utils/LogUtil";
import { query } from "express";
import mongodb from 'mongodb';
import { CreateQuery, Query } from "mongoose";

/**
 * Từ analyzer-data lấy được, clone các news feed về backend news feed 
 */
export class CrawlerToBackendSaveNewsFeed extends DbScript<any> {
    public constructor(private readonly analyzerCollection: mongodb.Collection<any>, private readonly sessionCode: string) {
        super();
    }

    private async getAnalyzerData(): Promise<any[]> {
        try {
            const data = await this.analyzerCollection
                .find({})
                .sort({ trendingScore: -1 })
                .toArray();
            return data || [];
        } catch (e) {
            return [];
        }
    }

    protected async runInternal(): Promise<Reliable<any>> {
        const cursor = this.analyzerCollection.find({}).sort({ trendingScore: -1 });
        let bulkWrites = [];
        const bulkDocumentsSize = 100;
        let i = 0;
        for await (const item of cursor) {
            i++;
            const rawTargetId = item.targetId;

            if (!rawTargetId) {
                continue;
            }

            const targetId = new mongodb.ObjectId(item.targetId);
            const newsFrom = await (await CrawlerDatabase.waitInstance()).news2Dao.model.findById(rawTargetId).exec();
            if (newsFrom) {

                const newsTo: CreateQuery<News> = {
                    title: newsFrom.title,
                    summary: newsFrom.summary,
                    content: newsFrom.content,
                    rawContent: newsFrom.rawContent,
                    thumbnail: newsFrom.thumbnail,
                    crawlDate: newsFrom.crawlDate,
                    publicationDate: newsFrom.publicationDate,
                    aggregator: newsFrom.aggregator,
                    source: newsFrom.source,
                    keywords: newsFrom.keywords,
                    categories: newsFrom.categories,
                    locals: newsFrom.locals
                }

                bulkWrites.push({
                    replaceOne: {
                        filter: { "source.url": newsTo.source?.url },
                        upsert: true,
                        replacement: newsTo
                    }
                })
            }

            if (i % bulkDocumentsSize == 0) {
                await (await AppDatabase.waitInstance()).news2Dao.model.bulkWrite(bulkWrites);
                bulkWrites = [];
            }

        }

        if (bulkWrites.length != 0) {
            await (await AppDatabase.waitInstance()).news2Dao.model.bulkWrite(bulkWrites);
        }

        const log = "Upsert " + i + " news from CrawlerDatabase to AppDatabase";
        LoggingUtil.consoleLog(log);
        return Reliable.Success(log);
    }

}