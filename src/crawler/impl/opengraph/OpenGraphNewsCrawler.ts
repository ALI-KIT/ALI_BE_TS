import { Reliable } from '@core/repository/base/Reliable';
import { ICrawlerManager } from '@crawler/base/CrawlerManager';
import { NewsCrawler } from '@crawler/base/NewsCrawler';
import { Domain } from '@entities/Domain';
import { News } from '@entities/News2';
import { CreateQuery } from 'mongoose';
import ogs from "open-graph-scraper";
import { SuccessResult, ErrorResult } from "open-graph-scraper";

/**
 * Một số trang tin (trang news detail) có tuân thủ chuẩn Open Graph của Facebook.
 * Các trang như này ta có thể lấy được thông tin mà trang hiển thị mà không cần biết nội dung trang viết cái gì.
 */
export abstract class OpenGraphNewsCrawler extends NewsCrawler {

    protected async parseHtml(content: string): Promise<Reliable<CreateQuery<News>>> {
        const og = await ogs({
            url: "",
            html: content
        });

        return await this.parseHtmlThen(content, og);
    }

    protected async parseHtmlThen(content: string, opengraph: SuccessResult | ErrorResult): Promise<Reliable<CreateQuery<News>>> {
        if (opengraph.error) {
            return Reliable.Success<CreateQuery<News>>(null);
        } else {
            const result = opengraph.result;
            const title = result.ogTitle;
            const summary = result.ogDescription;
            if (title && summary) {
                return Reliable.Success({
                    title: title || "",
                    summary: summary || "",
                    content: "",
                    thumbnail: result.ogDescription || "",
                    crawlDate: new Date(Date.now()),
                    publicationDate: new Date(Date.now()),
                    aggregator: new Domain(
                        'tindiaphuongorg',
                        'https://tindiaphuong.org/',
                        'Tin Địa Phương',
                        "https://tindiaphuong.org/"
                    ),
                    source: new Domain(
                        this.name,
                        this.getDisplayName(),
                        this.url
                    ),
                    keywords: [],
                    categories: [],
                    locals: []
                });
            }
        }

        return Reliable.Success<CreateQuery<News>>(null);
    }

}

export class OpenGraphNewsCrawlerImpl extends OpenGraphNewsCrawler {
    constructor(private _name: string, private _displayName: string, private _baseUrl: string, url: string, piority: number = 5, manager?: ICrawlerManager) {
        super(url, piority, manager);
    }

    public getName(): string {
        return this._name;
    }
    public getDisplayName(): string {
        return this._displayName;
    }
    public getBaseUrl(): string {
        return this._baseUrl;
    }
}