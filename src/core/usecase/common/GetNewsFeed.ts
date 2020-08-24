import { BaseUsecase} from '@core/usecase/BaseUseCase'
import { Reliable } from '@core/repository/base/Reliable';
import { NewsRepository } from '@core/repository/base/NewsRepository';
import { inject, injectable } from 'inversify';
import { TYPES_REPOSITORY } from '@core/di/Types';

export class Param {
    readonly locationIds: string[] = [];
    readonly keywords: string[] = [];
    constructor(locationIds: string[], keywords: string[]) {
        this.locationIds.push.apply(this.locationIds, locationIds)
        this.keywords.push.apply(this.keywords, keywords);
    }
}

@injectable()
export class GetNewsFeed extends BaseUsecase<string, Reliable<string>> {
    constructor(@inject(TYPES_REPOSITORY.NewsRepository) private newsRepository: NewsRepository) {
        super();
    }

    async invoke(param: string): Promise<Reliable<string>> {
        return await this.newsRepository.talk(param);
    }

}