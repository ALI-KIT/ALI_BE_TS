import { BaseUsecase } from '@core/usecase/BaseUseCase'
import { Reliable } from '@core/repository/base/Reliable';
import { NewsRepository } from '@core/repository/base/NewsRepository';
import { inject, injectable } from 'inversify';
import { TYPES_REPOSITORY } from '@core/di/Types';
import { News } from '@entities/News2';
import { AliDbClient } from '@dbs/AliDbClient';
import AppDatabase from '@daos/AppDatabase';
import MongoClient from 'mongodb';

export class Param {
    constructor(readonly locationCodes: string[], readonly keywords: string[], readonly limit: number, readonly skip: number) {
    }
}

/**
 * Tìm kiếm danh sách tin tức dựa theo khu vực và từ khóa
 * @params mảng khu vực (mã code), và mảng từ khóa (string)
 * @returns danh sách tin tức liên quan tới 
 */
@injectable()
export class GetNewsFeed extends BaseUsecase<Param, Reliable<Array<News>>> {
    public static readonly useV2 = true;
    constructor(@inject(TYPES_REPOSITORY.NewsRepository) private newsRepository: NewsRepository) {
        super();
    }

    async invoke(param: Param): Promise<Reliable<Array<News>>> {
        return this.invoke_V2(param);
    }

    async invoke_V1(param: Param): Promise<Reliable<Array<News>>> {
        return await this.newsRepository.getNewsFeed(param.locationCodes, param.keywords, param.limit, param.skip);
    }

    async invoke_V2(param: Param): Promise<Reliable<Array<News>>> {
        const analyzers = await AliDbClient.getInstance()
            .useALIDB()
            .collection("server-analyzer-data")
            .find({})
            .sort({ publicationDate: -1 })
            .skip(param.skip).limit(param.limit).toArray();
        const ids: MongoClient.ObjectId[] = []

        analyzers.forEach(analyzer => {
            if (analyzer.targetId) {
                const id: MongoClient.ObjectId = analyzer.targetId;
                if (id) {
                    ids.push(id);
                }
            }
        })
        const feeds = await AppDatabase.getInstance().news2Dao.model.find({ _id: { $in: ids } });
        const tempMap = new Map();
        const orderedFeeds: News[] = [];

        feeds.forEach(feed => {
            const id : MongoClient.ObjectId = feed._id;
            if(id)
            tempMap.set(id.toHexString(), feed)
        });
        ids.forEach(id => {
            const feed = tempMap.get(id.toHexString());
            if (feed) {
                orderedFeeds.push(feed);
            }
        })

        return Reliable.Success(orderedFeeds);
    }

}