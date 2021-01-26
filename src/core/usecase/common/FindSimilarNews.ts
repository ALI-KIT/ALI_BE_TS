import { TYPES_USECASES } from '@core/di/Types';
import { Reliable, Type } from '@core/repository/base/Reliable';
import { News } from '@entities/News2';
import { inject, injectable } from 'inversify';
import { compareTwoStrings } from 'string-similarity';
import { BaseUsecase } from '../BaseUseCase';
import { GetNewsFeed, Param } from './GetNewsFeed';

export class FindSimilarNewsParam {
    constructor(readonly text: string, readonly limit: number, readonly skip: number, readonly findInRawContent: boolean = false, readonly minSimilarScore = 0.375) {
    }
}

/**
 * Cho một đoạn text (text == news.title + news.summary)
 * Tìm các tin tương tự cùng chủ đề (chỉ gồm các tin local)
 * Note: Khác với search (tồn tại các keywords trong tin tức một cách tuyệt đối), 
 * thuật toán này đánh giá mức độ giống nhau của đoạn text đã cho và tin tức trong data
 * (từ 0 đến 1), tin nào có mức độ giống cao sẽ gọi là tin tương tự
 */

@injectable()
export class FindSimilarNews extends BaseUsecase<FindSimilarNewsParam, Reliable<Array<News>>> {
    constructor(@inject(TYPES_USECASES.GetNewsFeed) private getNewsFeed: GetNewsFeed) {
        super()
    }

    async invoke(param: FindSimilarNewsParam): Promise<Reliable<News[]>> {
        const listReliable = await this.getNewsFeed.invoke(new Param(0, 0));
        if (listReliable.type == Type.FAILED || !listReliable.data) {
            return listReliable;
        }

        const items = listReliable.data!.map(news => { return { news: news, text: news.title + " " + news.summary + ((param.findInRawContent) ? (" " + news.rawContent) : "") || "" } });
        const sorted = items.map(item => {
            return { news: item.news, score: compareTwoStrings(param.text, item.text) }
        }).sort((x, y) => (y.score - x.score));
        const result: News[] = [];
        sorted.forEach(item => {
            if (item.score >= param.minSimilarScore) {
                result.push(item.news);
            }
        });
        //const result = sorted.length > 30 ? sorted.slice(0, 30) : sorted;
        return Reliable.Success(result);
    }

}