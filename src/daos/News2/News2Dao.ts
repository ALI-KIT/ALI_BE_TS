import { News, NewsSchema } from '@entities/News2';
import { Dao } from '@daos/Dao';

export class NewsDao extends Dao<News> {
    constructor() {
        super('news-2', NewsSchema);
    }


    public async getAllPaging(limit: number, skip: number): Promise<News[]> {
        const result = this.model.find({}).skip(skip).limit(limit);
        return result;
    }

}