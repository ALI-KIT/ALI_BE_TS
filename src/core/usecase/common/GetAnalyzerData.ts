import { Reliable } from '@core/repository/base/Reliable';
import { AliDbClient } from '@dbs/AliDbClient';
import { injectable } from 'inversify';
import { BaseUsecase } from '../BaseUseCase';

export class GetAnalyzerListParam {
    constructor(readonly limit: number, readonly skip: number) {
    }
}

@injectable()
export class GetAnalyzerList extends BaseUsecase<GetAnalyzerListParam, Reliable<Array<any>>> {
    async invoke(param: GetAnalyzerListParam): Promise<Reliable<Array<any>>> {
        const data = await AliDbClient.getInstance()
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