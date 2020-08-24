import { Domain } from '@entities/Domain'
import { Local } from '@entities/Local'
import {News} from '@entities/News2'

/**
 * Feed là model biểu diễn tin tức, model này được gửi thẳng cho FE
 * NOTE: Bỏ các cột: crawlDate, aggregator
 */
export class FeFeed {
    title?: string
    summary?: string
    content?: string

    thumbnail?: string

    publicationDate?: Date
    source?: Domain

    keywords?: string[]
    locals?: Local[]

    categories?: string[]

    public static of(news : News) : FeFeed {
        const data = new FeFeed();
        data.title = news.title || '';
        data.summary = news.summary || '';
        data.thumbnail = news.thumbnail || ''
        data.publicationDate = news.publicationDate;
        data.source = news.source;
        data.keywords = news.keywords;
        data.locals = news.locals;
        data.categories = news.categories;

        data.content = news.content;

        return data;
    }
}

/**
 * Biểu diễn Feed trả về cho FE
 * NOTE: loại bỏ crawlData, aggregator và content so với News
 */
export class FeShortFeed {
    title?: string
    summary?: string
    thumbnail?: string

    publicationDate?: Date
    source?: Domain

    keywords?: string[]
    locals?: Local[]

    categories?: string[]

    public static of(news : News) : FeFeed {
        const data = new FeFeed();
        data.title = news.title || '';
        data.summary = news.summary || '';
        data.thumbnail = news.thumbnail || ''
        data.source = news.source || null;
        data.keywords = news.keywords || null;
        data.locals = news.locals || null;
        data.categories = news.categories || null;

        return data;
    }
}