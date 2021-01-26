import { injectable } from "inversify";
import { BaseUsecase } from '../BaseUseCase';
import { Reliable } from '@core/repository/base/Reliable';
import { News } from '@entities/News2';
import AppDatabase from '@daos/AppDatabase';

@injectable()
export class GetNewsDetail extends BaseUsecase<string, Reliable<News>> {
    constructor() {
        super();
    }

    async invoke(id: string): Promise<Reliable<News>> {
        if (!id) return Reliable.Failed("Id must not be null or empty");

        try {
            const news = await (await AppDatabase.waitInstance()).news2Dao.findById(id);
            return Reliable.Success(news);
        } catch (e) {
            return Reliable.Failed("Could not get news detail", e);
        }
    }
}