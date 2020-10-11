import { Reliable } from '@core/repository/base/Reliable';
import { OpenGraphNewsCrawler } from '@crawler/base/OpenGraphNewsCrawler';
import { Domain } from '@entities/Domain';
import { News } from '@entities/News2';
import CrawlUtil from '@utils/crawlUtils';
import cheerio from 'cheerio';
import { CreateQuery } from 'mongoose';

export class BaoMoiNewsDetailCrawler extends OpenGraphNewsCrawler {
    public getName(): string {
        return "baomoi";
    }
    public getDisplayName(): string {
        return "Báo mới";
    }
    public getBaseUrl(): string {
        return "https://baomoi.com";
    }

    protected async parseHtmlThen(htmlContent: string, prevData: Reliable<CreateQuery<News>>): Promise<Reliable<CreateQuery<News>>> {
        const $ = cheerio.load(htmlContent, { decodeEntities: false });
        const sourceUrl = $('p.bm-source a').attr('href') || "";
        const prettyUrl = CrawlUtil.prettyUrl(sourceUrl).data || "";
        const baseUrl = CrawlUtil.baseUrl(sourceUrl).data || "";

        const name = prettyUrl;
        const source: Domain = {
            name: name,
            baseUrl: baseUrl,
            displayName: $('div.article a.source')?.first()?.text()?.trim() || '',
            url: sourceUrl
        }

        const aggregator: Domain = {
            name: 'baomoi',
            baseUrl: this.getBaseUrl(),
            displayName: 'Báo mới',
            url: this.url
        };

        if (prevData.data) {
            prevData.data.source = source;
            prevData.data.aggregator = aggregator;

            const content = prevData.data.content;
            prevData.data.content = $('div.article__body').html() || content || "";

        }
        return prevData;
    }
}