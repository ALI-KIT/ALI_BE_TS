import { Crawler } from '@crawler/base/Crawler';
import { News } from '@entities/News2';
import { CreateQuery } from 'mongoose';
import AppDatabase from '@daos/AppDatabase';

export abstract class NewsCrawler extends Crawler<CreateQuery<News> | null> {

    public async saveResult(result: CreateQuery<News>) : Promise<string> {
        const exist = await AppDatabase.getInstance().news2Dao.findOne({thumbnail: result.thumbnail||""})
        if(exist) return 'existed in database';
        else if(result)
        AppDatabase.getInstance().news2Dao.create(result);
        return ''
    }
}