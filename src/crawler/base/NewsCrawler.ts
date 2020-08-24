import { Crawler } from '@crawler/base/Crawler';
import { News } from '@entities/News2';
import { CreateQuery } from 'mongoose';
import AppDatabase from '@daos/AppDatabase';

export abstract class NewsCrawler extends Crawler<CreateQuery<News> | null> {

    public async saveResult(result: CreateQuery<News>): Promise<string> {
        if (!result || !result.source?.baseUrl) return 'invalid params';
        else if (await AppDatabase.getInstance().news2Dao.findOne({ 'source.baseUrl': result.source?.baseUrl }))
            return 'existed in database';
        else {
            AppDatabase.getInstance().news2Dao.create(result);
            return ''
        }
    }
}