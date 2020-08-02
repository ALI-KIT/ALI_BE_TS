import { News, NewsSchema } from '@entities/News2';
import { IDao } from '@daos/IDao';

export class NewsDao extends IDao<News> {
    constructor() {
        super('news-2', NewsSchema);
    }
    
    public async create(item: News): Promise<News | Error | null> {
        try {
            const data = await this.model.create(item);
            return data;
        }
        catch (error) {
            return error;
        }
    }

    public async getAllPaging(limit: number, skip: number) : Promise<News[]> {
        const result = this.model.find({}).skip(skip).limit(limit);
        return result;
    }

}