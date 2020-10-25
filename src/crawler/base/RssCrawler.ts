import { Reliable, Type } from '@core/repository/base/Reliable';
import { Crawler, HtmlCrawler } from './Crawler';
import RssParser from 'rss-parser';
import CrawlUtil from '@utils/CrawlUtils';
import Parser from 'rss-parser';
import { VnExpressNewsDetailCrawler } from './OpenGraphNewsCrawler';

export abstract class RssCrawler extends HtmlCrawler<RssParser.Output> {
    protected async parseHtml(content: string): Promise<Reliable<RssParser.Output>> {
        const parser = new RssParser();
        const feed = await parser.parseString(content);
        const links: string[] = [];

        feed.items?.forEach(item => {
            if (item.link) {
                links.push(item.link);
            }
        });

        const parseRssReliable = await this.parseHtmlInternal(links);
        if (parseRssReliable.type == Type.FAILED) {
            return Reliable.Custom(Type.FAILED, parseRssReliable.message, parseRssReliable.error || undefined, feed);
        }

        return Reliable.Success(feed);
    }

    protected abstract async parseHtmlInternal(links: string[]): Promise<Reliable<string[]>>;

    public async saveResult(result: string[]): Promise<Reliable<string[]>> {
        return Reliable.Success(result);
    }
}

export class VnExpressTinMoiRssCrawler extends RssCrawler {
    constructor() {
        super("https://vnexpress.net/rss/tin-moi-nhat.rss", "VnExpress Rss");
    }
    protected async parseHtmlInternal(links: string[]): Promise<Reliable<string[]>> {
        for (let link of links) {
            let crawler = new VnExpressNewsDetailCrawler(link);
            await this.manager?.addNewCrawler(crawler);
        }
        return Reliable.Success(links);
    }
}