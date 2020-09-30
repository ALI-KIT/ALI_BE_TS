import { Crawler } from '@crawler/base/Crawler';
import { News } from '@entities/News2';
import { CreateQuery, Error } from 'mongoose';
import AppDatabase from '@daos/AppDatabase';
import { Reliable } from '@core/repository/base/Reliable';

export abstract class NewsCrawler extends Crawler<CreateQuery<News>> {

    public async saveResult(result: CreateQuery<News>): Promise<Reliable<CreateQuery<News>>> {
        if (!result || !result.source?.url) {
            return Reliable.Failed('invalid params: result = ' + result + ", result.source.baseUrl = " + result?.source?.url);
        }
        const found = await AppDatabase.getInstance().news2Dao.findOne({ 'source.url': result.source?.url });
        if (found) {
            return Reliable.Failed('this news had existed in database: ' + result.title);
        }
        else {
            const re = await AppDatabase.getInstance().news2Dao.create(result);
            if (!re) {
                return Reliable.Failed("Something wrong when trying to save news [" + result.title + "]");
            }
            if (!re || re instanceof Error) {
                return Reliable.Failed("Error when trying to save news [" + result.title + ". " + re.message);
            }

            return Reliable.Success(result);
        }
    }
}