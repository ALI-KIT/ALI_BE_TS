import { Reliable } from '@core/repository/base/Reliable';
import { MongoDbBackendClient } from '@daos/MongoDbBackendClient';
import { injectable } from 'inversify';
import { BaseUsecase } from '../BaseUseCase';

export class Params {
    constructor(readonly limit: number, readonly skip: number, readonly query = {}, readonly sort = { "trendingScore": -1 }) {
    }
}

@injectable()
export class GetAnalyzerData extends BaseUsecase<Params, Reliable<Array<any>>> {
    async invoke(param: Params): Promise<Reliable<Array<any>>> {
        const data = await (await MongoDbBackendClient.waitInstance())
            .useALIDB()
            .collection("server-analyzer-data")
            .find(param.query)
            .sort(param.sort)
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