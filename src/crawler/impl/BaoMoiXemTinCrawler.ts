import { NewsCrawler } from '@crawler/base/NewsCrawler';
import { News } from '@entities/News2';
import cheerio from 'cheerio';
import { Local } from '@entities/Local';
import { CreateQuery } from 'mongoose';
import { Domain } from '@entities/Domain';
import { BaoMoiTagCrawler } from '@crawler/impl/BaoMoiTagCrawler';
import { Reliable } from '@core/repository/base/Reliable';
import CrawlUtil from '@utils/CrawlUtils';
import LoggingUtil from '@utils/LogUtil';

export class BaoMoiXemTinCrawler extends NewsCrawler {
    constructor(url: string, priority: number = 5) {
        super(url, "Báo mới");
        this.priority = priority;
    }

    async parseHtml(html: string): Promise<Reliable<CreateQuery<News>>> {
        const $ = cheerio.load(html, { decodeEntities: false });

        const title = $('h1.article__header').text()
        const summary = $('div.article__sapo').text()
        const content = $('div.article__body').html() || ''
        const rawContent = CrawlUtil.getRawTextContent(content);
        const aggregator: Domain = {
            name: 'baomoi',
            baseUrl: this.baseUrl,
            displayName: 'Báo mới',
            url: this.url
        };

        const sourceUrl = $('p.bm-source a').attr('href') || ''
        const prettyUrl = CrawlUtil.prettyUrl(sourceUrl).data || "";
        const baseUrl = CrawlUtil.baseUrl(sourceUrl).data || "";

        const name = prettyUrl;
        const source: Domain = {
            name: name,
            baseUrl: baseUrl,
            displayName: $('div.article a.source')?.first()?.text()?.trim() || '',
            url: sourceUrl
        }
        
        const thumbnail = $('div.article p.body-image img').first().attr('src') || '';

        const crawlDate = new Date(Date.now());
        const pDString = $('div.article__meta time').attr('datetime');
        const publicationDate = new Date(pDString || Date.now());
        const categories = $('div.breadcrumb a.cate').toArray().map(element => $(element).text().trim());
        const tagArray = $('div .keyword').toArray();
        const keywords = tagArray.map(element => $(element).text().trim());
        const tagUrlArray = tagArray.map(element => this.baseUrl + $(element).attr('href') || '');

        const locals: Local[] = [];
        LoggingUtil.consoleLog('finish getting news: ' + title);
        LoggingUtil.consoleLog("should craw tag : " + this.manager?.isAllowRecursion);

        if (this.manager?.isAllowRecursion && tagUrlArray && tagUrlArray.length !== 0) {
            for (let value in tagUrlArray) {
                LoggingUtil.consoleLog('xem tin found new tag url [' + value + ']');
                await this.manager?.addNewCrawler(new BaoMoiTagCrawler(value, value, 1, this.priority - 2));
            };
        }

        return Reliable.Success({
            title,
            summary,
            content,
            rawContent,
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