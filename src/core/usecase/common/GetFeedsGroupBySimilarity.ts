import { Reliable } from '@core/repository/base/Reliable';
import { AliDbClient } from '@dbs/AliDbClient';
import { FeFeed, FeShortFeed } from '@entities/fe/FeFeed';
import { injectable } from 'inversify';
import { BaseUsecase } from '../BaseUseCase';

export class GetFeedsGroupBySimilarityParam {
    constructor(
        public readonly skip: number,
        public readonly limit: number) {
    }
}

@injectable()
export class GetFeedsGroupBySimilarity extends BaseUsecase<GetFeedsGroupBySimilarityParam, Reliable<Array<FeShortFeed>>> {
    async invoke(param: GetFeedsGroupBySimilarityParam): Promise<Reliable<FeShortFeed[]>> {
        const collection = AliDbClient.getInstance().useALIDB().collection("analyzer-similarity");
        const data = await collection.find({})
            .sort({ index: 1 })
            .skip(param.skip)
            .limit(param.limit)
            .toArray();
        if (!data) {
            return Reliable.Failed("Null data");
        } else {
            return Reliable.Success(data);
        }
    }

} 