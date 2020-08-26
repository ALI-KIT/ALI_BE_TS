import { injectable, inject } from 'inversify';
import { BaseUsecase } from '../BaseUseCase';
import { News } from '@entities/News2';
import { Reliable } from '@core/repository/base/Reliable';
import { FeFeed, FeShortFeed } from '@entities/fe/FeFeed';

/**
 * Convert một mảng News => FeFeed
 */
@injectable()
export class ConvertNewsToFeFeed extends BaseUsecase<News, Reliable<FeFeed>> {
    constructor() {
        super();
    }

    async invoke(news: News): Promise<Reliable<FeFeed>> {
        return Reliable.Success(FeFeed.of(news));
    }

}

@injectable()
export class ConvertNewsToFeShortFeed extends BaseUsecase<News, Reliable<FeShortFeed>> {
    constructor() {
        super();
    }

    async invoke(news: News): Promise<Reliable<FeShortFeed>> {
        return Reliable.Success(FeShortFeed.of(news));
    }

}

@injectable()
export class ConvertNewsToFeFeeds extends BaseUsecase<News[], Reliable<FeFeed[]>> {
    constructor() {
        super();
    }

    async invoke(news: News[]): Promise<Reliable<FeFeed[]>> {
        return Reliable.Success(news.map(n => { return FeFeed.of(n) }));
    }

}

@injectable()
export class ConvertNewsToFeShortFeeds extends BaseUsecase<News[], Reliable<FeShortFeed[]>> {
    constructor() {
        super();
    }

    async invoke(news: News[]): Promise<Reliable<FeShortFeed[]>> {
        return Reliable.Success(news.map(n => { return FeShortFeed.of(n) }));
    }

}