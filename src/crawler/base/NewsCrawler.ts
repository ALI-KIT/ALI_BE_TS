import { Crawler, HtmlCrawler } from '@crawler/base/Crawler';
import { News } from '@entities/News2';
import { CreateQuery, Error } from 'mongoose';
import AppDatabase from '@daos/AppDatabase';
import { Reliable, Type } from '@core/repository/base/Reliable';

export abstract class NewsCrawler extends HtmlCrawler<CreateQuery<News>> {

    public async saveResult(result: CreateQuery<News>): Promise<Reliable<News>> {
        if (!result || !result.source?.url) {
            return Reliable.Failed('invalid params: result = ' + result + ", result.source.baseUrl = " + result?.source?.url);
        }
        const found = await AppDatabase.getInstance().news2Dao.findOne({ 'source.url': result.source?.url });
        if (found) {
            return Reliable.Failed('News existed in database: ' + result.title);
        }
        else {
            const re = await AppDatabase.getInstance().news2Dao.create(result);
            if (re.type == Type.FAILED || !re.data) {
                return Reliable.Failed("Error when trying to save news [" + result.title + "]. ");
            } else {
                return Reliable.Success(re.data!);
            }
        }
    }
}