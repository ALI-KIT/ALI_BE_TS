import { Crawler, HtmlCrawler } from '@crawler/base/Crawler';
import { News } from '@entities/News2';
import { CreateQuery, Error } from 'mongoose';
import { Reliable, Type } from '@core/repository/base/Reliable';
import LoggingUtil from '@utils/LogUtil';
import CrawlerDatabase from '@daos/CrawlerDatabase';

class NewsBulkWriter {
    private static instance = new NewsBulkWriter();
    private operations = [];
    private readonly size = 25;
    index = 0;

    private async saveInternal(query: CreateQuery<News>) {
        if (!query.title || !query.summary || !query.thumbnail) {
            return;
        }

        this.index++;
        this.operations.push({
            replaceOne: {
                filter: { "source.url": query.source?.url },
                upsert: true,
                replacement: query
            }
        });

        if (this.index % this.size === 0) {
            const result = await CrawlerDatabase.getInstance().news2Dao.model.bulkWrite(this.operations);
            this.operations = [];
            LoggingUtil.consoleLog("Upsert " + this.index + " documents");
        }
    }

    private async saveLeftInternal() {
        if (this.operations.length != 0) {
            try {
                const result = await CrawlerDatabase.getInstance().news2Dao.model.bulkWrite(this.operations);
                this.operations = [];
            } catch (e) {
                LoggingUtil.consoleLog(e);
            }
        }
        LoggingUtil.consoleLog("Upsert finished " + this.index + " documents");
    }

    public static async saveLeft() {
        await this.instance.saveLeftInternal();
    }

    public static async save(query: CreateQuery<News>) {
        await NewsBulkWriter.instance.saveInternal(query);
    }
}

export abstract class NewsCrawler extends HtmlCrawler<CreateQuery<News>> {

    public async saveResult(result: CreateQuery<News>): Promise<Reliable<News>> {
        await NewsBulkWriter.save(result);
        return Reliable.Success(null);
    }

    public static async saveLeft() {
        await NewsBulkWriter.saveLeft();
    }

    public async saveResultOld(result: CreateQuery<News>): Promise<Reliable<News>> {
        // check if document is not null and document.source.url is not null
        if (!result || !result.source?.url) {
            return Reliable.Failed('invalid params: result = ' + result + ", result.source.baseUrl = " + result?.source?.url);
        }

        // check if document.source.url exists in database
        const exists = await CrawlerDatabase.getInstance().news2Dao.model.exists({ 'source.url': result.source?.url });
        if (exists) {
            return Reliable.Failed('News existed in database: ' + result.title);
        }
        else {
            // create document
            const re = await CrawlerDatabase.getInstance().news2Dao.create(result);
            if (re.type == Type.FAILED || !re.data) {
                return Reliable.Failed("Error when trying to save news [" + result.title + "]. ");
            } else {
                return Reliable.Success(re.data!);
            }
        }
    }
}