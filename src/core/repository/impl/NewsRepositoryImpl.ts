import { injectable, inject } from "inversify";
import "reflect-metadata";

import { NewsRepository } from '../base/NewsRepository';

@injectable()
export class NewsRepositoryImpl implements NewsRepository {

}