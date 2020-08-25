import { Crawler } from '@crawler/base/Crawler';
import { News } from '@entities/News2';
import { CreateQuery } from 'mongoose';
import AppDatabase from '@daos/AppDatabase';

export abstract class NewsCrawler extends Crawler<CreateQuery<News> | null> {

    public async saveResult(result: CreateQuery<News>): Promise<string> {
        if (!result || !result.source?.url) {
            return 'invalid params: result = '+ result +", result.source.baseUrl = "+result?.source?.url;
        }
        const found = await AppDatabase.getInstance().news2Dao.findOne({ 'source.url': result.source?.url });
        if (found) {
            return 'existed in database: '+ result.title;
        }
        else {
            await AppDatabase.getInstance().news2Dao.create(result);
            return ''
        }
    }
}