import { Reliable, Type } from '@core/repository/base/Reliable';
import { Domain } from '@entities/Domain';
import { Local } from '@entities/Local';
import { News } from '@entities/News2';
import Axios from 'axios';
import cheerio from 'cheerio';
import { TYPE } from 'inversify-express-utils';
import { CreateQuery } from 'mongoose';
import { title } from 'process';
import { Crawler } from './Crawler';
import { ICrawlerManager } from './CrawlerManager';
import { NewsCrawler } from './NewsCrawler';

export class OGNewsGenerator {

    public async execute(crawler: Crawler<any>, htmlContent: string): Promise<Reliable<CreateQuery<News>>> {
        const $ = cheerio.load(htmlContent);

        const title = $('meta[property="og\\:title"]')?.first()?.attr('content') || $('meta[name=\'title\']')?.first()?.attr('content') || "";
        const summary = $('meta[property="og\\:description"]')?.first()?.attr('content') || $('meta[name=\'description\']')?.first()?.attr('content') || "";
        const content = summary;

        const crawlDate = new Date(Date.now());
        const pDString = $('meta[property="article\\:published_time"]').attr('content');
        const publicationDate = new Date(pDString || Date.now());

        const thumbnail = $('meta[property="og\\:image"]')?.first()?.attr('content') || $('meta[itemprop=\'image\']')?.first()?.attr('content') || "";

        const aggregator: Domain = {
            name: 'tin-dia-phuong',
            baseUrl: "https://tindiaphuong.org",
            displayName: 'Tin địa phương',
            url: 'https://tindiaphuong.org'
        };
        const source: Domain = {
            name: crawler.name,
            baseUrl: crawler.baseUrl,
            displayName: crawler.displayName,
            url: crawler.url
        }

        const categories = $('div.breadcrumb a.cate').toArray().map(element => $(element).text().trim());
        const tagArray = $('div .keyword').toArray();
        const keywords = tagArray.map(element => $(element).text().trim());
        const tagUrlArray = tagArray.map(element => crawler.baseUrl + $(element).attr('href') || '');

        const locals: Local[] = [];

        return Reliable.Success({
            title,
            summary,
            content,
            thumbnail,
            crawlDate,
            publicationDate,
            aggregator,
            source,
            keywords,
            categories,
            locals
        });
    }
}

export abstract class OpenGraphNewsCrawler extends NewsCrawler {

    protected async parseHtml(htmlContent: string): Promise<Reliable<CreateQuery<News>>> {
        return await this.parseHtmlThen(htmlContent, Reliable.Success<CreateQuery<News>>(null))
    }

    protected async parseHtmlThen(htmlContent: string, prevData: Reliable<CreateQuery<News>>): Promise<Reliable<CreateQuery<News>>> {

        const ogpData = await new OGNewsGenerator().execute(this, htmlContent);
        const data: CreateQuery<News> = {
            title: prevData.data?.title || ogpData.data?.title || "",
            summary: prevData.data?.summary || ogpData.data?.summary || "",
            content: prevData.data?.content || ogpData.data?.content || '',
            thumbnail: prevData.data?.thumbnail || ogpData.data?.thumbnail || '',
            crawlDate: prevData.data?.crawlDate || ogpData.data?.crawlDate || new Date(Date.now()),
            publicationDate: prevData.data?.crawlDate || ogpData.data?.crawlDate || 0,
            aggregator: prevData.data?.aggregator || ogpData.data!.aggregator,
            source: prevData.data?.source || ogpData.data!.source,
            keywords: [],
            categories: [],
            locals: []
        }
        return Reliable.Success(data);
    }
}

export class SimpleOpenGraphNewsCrawler extends OpenGraphNewsCrawler {
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

export class TuoiTreNewsDetailCrawler extends OpenGraphNewsCrawler {
    public getName(): string {
        return "tuoi-tre-online";
    }
    public getDisplayName(): string {
        return "Tuổi Trẻ Online";
    }
    public getBaseUrl(): string {
        return "https://tuoitre.vn";
    }
}

export class VnExpressNewsDetailCrawler extends OpenGraphNewsCrawler {
    public getName(): string {
        return "vnexpress";
    }
    public getDisplayName(): string {
        return "VnExpress";
    }
    public getBaseUrl(): string {
        return "https://vnexpress.net";
    }
}

export class ThanhNienNewsDetailCrawler extends OpenGraphNewsCrawler {
    public getName(): string {
        return "thanh-nien";
    }
    public getDisplayName(): string {
        return "Thanh Niên";
    }
    public getBaseUrl(): string {
        return "https://thanhnien.vn";
    }
}

export class DanTriNewsDetailCrawler extends OpenGraphNewsCrawler {
    public getName(): string {
        return "dan-tri";
    }
    public getDisplayName(): string {
        return "Báo Dân trí";
    }
    public getBaseUrl(): string {
        return "https://dantri.com.vn";
    }
}