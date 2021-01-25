import { Reliable } from '@core/repository/base/Reliable';
import { MongoDbBackendClient } from '@daos/MongoDbBackendClient';
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
        const collection = MongoDbBackendClient.getInstance().useALIDB().collection("analyzer-similarity");
        const data = await collection.find({})
            .sort({ index: 1 })
            .skip(param.skip)
            .limit(param.limit)
            .toArray();
        if (data) {
            data.forEach(item => {
                item.sessionCode = undefined;
                item.id = item._id;
                item._id = undefined;
                if (item.data && Array.isArray(item.data)) {
                    const arr: any[] = item.data;
                    if (arr && arr.length > 5) {
                        item.data = arr.splice(0, 5);
                    }
                }
            })
        }
        if (!data) {
            return Reliable.Failed("Null data");
        } else {
            return Reliable.Success(data);
        }
    }

} 