import { injectable, inject } from "inversify";
import "reflect-metadata";

import { NewsRepository } from '../base/NewsRepository';
import { Reliable } from '../base/Reliable';
import { News } from '@entities/News2';
import AppDatabase from '@daos/AppDatabase';

@injectable()
export class NewsRepositoryImpl implements NewsRepository {

    async talk(words: string): Promise<Reliable<string>> {
        return Reliable.Success('Hi ' + words + ', I am human');
    }

    async do(): Promise<Reliable<boolean>> {
        const result = Reliable.Failed<string>("");

        throw new Error("Method not implemented.");
    }

    async getNewsFeed(locationCodes: string[], keywords: string[], limit: number, skip: number): Promise<Reliable<Array<News>>> {
        try {
            const result = await AppDatabase.getInstance().news2Dao.model
            .find(keywords.length == 0 ? {} : { keywords: { $in: keywords } })
            .sort({publicationDate: -1})
            .limit(limit)
            .skip(skip);
            return Reliable.Success(result)
        } catch (e) {
            return Reliable.Failed("Could not get news feed", e);
        }
    }

}