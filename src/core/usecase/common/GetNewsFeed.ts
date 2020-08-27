import { BaseUsecase} from '@core/usecase/BaseUseCase'
import { Reliable } from '@core/repository/base/Reliable';
import { NewsRepository } from '@core/repository/base/NewsRepository';
import { inject, injectable } from 'inversify';
import { TYPES_REPOSITORY } from '@core/di/Types';
import { News } from '@entities/News2';

export class Param {
    constructor(readonly locationCodes: string[],readonly keywords: string[], readonly limit: number, readonly skip: number) {
    }
}

/**
 * Tìm kiếm danh sách tin tức dựa theo khu vực và từ khóa
 * @params mảng khu vực (mã code), và mảng từ khóa (string)
 * @returns danh sách tin tức liên quan tới 
 */
@injectable()
export class GetNewsFeed extends BaseUsecase<Param, Reliable<Array<News>>> {
    constructor(@inject(TYPES_REPOSITORY.NewsRepository) private newsRepository: NewsRepository) {
        super();
    }

    async invoke(param: Param): Promise<Reliable<Array<News>>> {
        return await this.newsRepository.getNewsFeed(param.locationCodes, param.keywords, param.limit, param.skip);
    }

}