import "reflect-metadata";
import { Container } from 'inversify';
import { NewsRepository } from '../repository/base/NewsRepository';
import { NewsRepositoryImpl } from '../repository/impl/NewsRepositoryImpl';
import { GetNewsFeed } from '../usecase/common/GetNewsFeed';
import { TYPES_REPOSITORY, TYPES_USECASES } from './Types';
import { ConvertNewsToFeFeed, ConvertNewsToFeShortFeed, ConvertNewsToFeFeeds, ConvertNewsToFeShortFeeds } from '@core/usecase/common/ConvertNewsToFeFeed';
import { GetNewsDetail } from '@core/usecase/common/GetNewsDetail';

const container = new Container();

// bind repository
container.bind<NewsRepository>(TYPES_REPOSITORY.NewsRepository).to(NewsRepositoryImpl).inSingletonScope();


// bind usecases
container.bind<GetNewsFeed>(TYPES_USECASES.GetNewsFeed).to(GetNewsFeed).inSingletonScope();
container.bind<ConvertNewsToFeFeed>(TYPES_USECASES.ConvertNewsToFeFeed).to(ConvertNewsToFeFeed).inSingletonScope();
container.bind<ConvertNewsToFeShortFeed>(TYPES_USECASES.ConvertNewsToFeShortFeed).to(ConvertNewsToFeShortFeed).inSingletonScope();

container.bind<ConvertNewsToFeFeeds>(TYPES_USECASES.ConvertNewsToFeFeeds).to(ConvertNewsToFeFeeds).inSingletonScope();
container.bind<ConvertNewsToFeShortFeeds>(TYPES_USECASES.ConvertNewsToFeShortFeeds).to(ConvertNewsToFeShortFeeds).inSingletonScope();

container.bind<GetNewsDetail>(TYPES_USECASES.GetNewsDetail).to(GetNewsDetail).inSingletonScope();

export default container;