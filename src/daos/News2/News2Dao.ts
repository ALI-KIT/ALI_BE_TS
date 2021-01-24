import { News, NewsSchema } from '@entities/News2';
import { Dao } from '@daos/Dao';
import { Connection } from 'mongoose';

export class NewsDao extends Dao<News> {
    constructor() {
        super('news-2', NewsSchema);
    }
}