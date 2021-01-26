import "reflect-metadata";

import { BaseUsecase } from '@core/usecase/BaseUseCase'
import { Reliable, Type } from '@core/repository/base/Reliable';
import { inject, injectable } from 'inversify';
import { TYPES_REPOSITORY, TYPES_USECASES } from '@core/di/Types';
import { News } from '@entities/News2';
import AppDatabase from '@daos/AppDatabase';
import MongoClient from 'mongodb';
import container from '@core/di/InversifyConfigModule';
import { GetAnalyzerData, Params } from './GetAnalyzerData';

export class Param {
    constructor(readonly limit: number, readonly skip: number, readonly query: any = {}, readonly sort : any = { "trendingScore": -1 }) {
    }
}

/**
 * Tìm kiếm danh sách tin tức dựa theo khu vực và từ khóa
 * @params mảng khu vực (mã code), và mảng từ khóa (string)
 * @returns danh sách tin tức liên quan tới 
 */
@injectable()
export class GetNewsFeed extends BaseUsecase<Param, Reliable<Array<News>>> {
    constructor() {
        super();
    }

    async invoke(param: Param): Promise<Reliable<Array<News>>> {
        return await this.invokeInternal(param);
    }

    private async invokeInternal(param: Param): Promise<Reliable<Array<News>>> {
        const getAnalyzerData = container.get<GetAnalyzerData>(TYPES_USECASES.GetAnalyzerData);
        if (!getAnalyzerData) {
            return Reliable.Failed("Could get the analyzer list");
        }

        const analyzersReliable = await getAnalyzerData.invoke(new Params(param.limit, param.skip, param.query, param.sort))
        if (analyzersReliable.type == Type.FAILED) {
            return Reliable.Failed(analyzersReliable.message, analyzersReliable.error);
        } else if (!analyzersReliable.data) {
            return Reliable.Failed("Could get the analyzer list");
        }

        const analyzers = analyzersReliable.data;
        const ids: MongoClient.ObjectId[] = []

        analyzers.forEach(analyzer => {
            if (analyzer.targetId) {
                const id: MongoClient.ObjectId = analyzer.targetId;
                if (id) {
                    ids.push(id);
                }
            }
        })
        const feeds = await (await AppDatabase.waitInstance()).news2Dao.model.find({ _id: { $in: ids } });
        const tempMap = new Map();
        const orderedFeeds: News[] = [];

        feeds.forEach(feed => {
            const id: MongoClient.ObjectId = feed._id;
            if (id)
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