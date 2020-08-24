import "reflect-metadata";
import { Container } from 'inversify';
import { NewsRepository } from '../repository/base/NewsRepository';
import { NewsRepositoryImpl } from '../repository/impl/NewsRepositoryImpl';
import { GetNewsFeed } from '../usecase/common/GetNewsFeed';
import { TYPES_REPOSITORY, TYPES_USECASES } from './Types';

const container = new Container();

// bind repository
container.bind<NewsRepository>(TYPES_REPOSITORY.NewsRepository).to(NewsRepositoryImpl).inSingletonScope();


// bind usecases
container.bind<GetNewsFeed>(TYPES_USECASES.GetNewsFeed).to(GetNewsFeed).inSingletonScope();


export default container;