import { Reliable } from '@core/repository/base/Reliable';
import { MongoDbBackendClient } from '@daos/MongoDbBackendClient';
import { injectable } from 'inversify';
import { BaseUsecase } from '../BaseUseCase';

export class Params {
    constructor(readonly limit: number, readonly skip: number) {
    }
}

@injectable()
export class GetAnalyzerData extends BaseUsecase<Params, Reliable<Array<any>>> {
    async invoke(param: Params): Promise<Reliable<Array<any>>> {
        const data = await MongoDbBackendClient.getInstance()
            .useALIDB()
            .collection("server-analyzer-data")
            .find({})
            .sort({ trendingScore: -1 })
            .skip(param.skip)
            .limit(param.limit)
            .toArray();
        if (!data) {
            return Reliable.Failed("Null analyzer list");
        } else {
            return Reliable.Success(data);
        }
    }
}