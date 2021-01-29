import { Reliable, Type } from '@core/repository/base/Reliable';
import { HtmlCrawler } from './Crawler';
import RssParser from 'rss-parser';
import { DynamicSourceOGNewsCrawler } from './OpenGraphNewsCrawler';

export abstract class RssCrawler extends HtmlCrawler<any> {
    protected async parseHtml(content: string): Promise<Reliable<RssParser.Output>> {
        const parser = new RssParser();
        let parserResultReliable = await parser.parseString(content)
            .then(value => Reliable.Success(value))
            .catch(e => Reliable.Failed<RssParser.Output>("Error when parsing html content to rss" + e));

        if (parserResultReliable.type == Type.FAILED) {
            return Reliable.Failed(parserResultReliable.message, parserResultReliable.error || undefined);
        } else if (!parserResultReliable.data) {
            return Reliable.Failed("RssParser output is null");
        }

        const links: string[] = [];
        const parserResult = parserResultReliable.data!;
        parserResult.items?.forEach(item => {
            if (item.link) {
                links.push(item.link);
            }
        });

        const parseRssReliable = await this.parseHtmlInternal(links);
        if (parseRssReliable.type == Type.FAILED) {
            return Reliable.Custom(Type.FAILED, parseRssReliable.message, parseRssReliable.error || undefined);
        } else {
            return Reliable.Success(null);
        }

    }

    protected abstract parseHtmlInternal(links: string[]): Promise<Reliable<string[]>>;

    public async saveResult(result: string[]): Promise<Reliable<string[]>> {
        return Reliable.Success(result);
    }
}

export class DynamicSourceRssCrawler extends RssCrawler {
    constructor(url: string, displayName: string, priority: number = 5) {
        super(url, displayName);
        this.priority = priority;
    }

    protected async parseHtmlInternal(links: string[]): Promise<Reliable<string[]>> {
        for (let link of links) {
            let crawler = new DynamicSourceOGNewsCrawler(link);
            crawler.priority = this.priority;
            await this.manager?.addNewCrawler(crawler);
        }
        return Reliable.Success(links);
    }
}