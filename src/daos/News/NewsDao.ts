import { News, ShortNews, NewsSchema} from '@entities/News';
import { IDao } from '@daos/IDao';

export class PagingData {
    public maxItem: number;
    public maxPage: number;

    constructor(maxItem: number, maxPage: number) {
        this.maxItem = maxItem;
        this.maxPage = maxPage;
    }
}

export class NewsDao extends IDao<News> {
    constructor() {
        super('news', NewsSchema)
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

    public async getMaxNewsAndMaxPage(limit: number): Promise<PagingData | null> {
        const count = await this.model.find({}).countDocuments().exec().catch(error => {
            return 0
        })

        return new PagingData(count | 0, Math.ceil(count/ limit));    
    }

    public async getMaxNewsAndMaxPageWithCondition(condition: any, limit: number) : Promise<PagingData | null> {
        const maxItem = await this.model.find(condition).countDocuments();
        const maxPage = Math.ceil(maxItem / limit);
        return new PagingData(maxItem, maxPage);
    }

    public async findAllWithCondition(condition: any, limit: number, skip: number) : Promise<News[]> {
        if(limit <0 || skip < 0) return await this.model.find(condition);
        else
        return await this.model.find(condition).skip(skip).limit(limit);
    }


}