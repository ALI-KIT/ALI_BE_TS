import { Reliable } from '@core/repository/base/Reliable';
import { OpenGraphNewsCrawler } from '@crawler/base/OpenGraphNewsCrawler';
import { Domain } from '@entities/Domain';
import { News } from '@entities/News2';
import CrawlUtil from '@utils/CrawlUtils';
import cheerio from 'cheerio';
import { CreateQuery } from 'mongoose';

export class BaoMoiNewsDetailCrawler extends OpenGraphNewsCrawler {

    protected async parseHtmlThen(htmlContent: string, prevData: Reliable<CreateQuery<News>>): Promise<Reliable<CreateQuery<News>>> {
        const $ = cheerio.load(htmlContent, { decodeEntities: false });

        const sourceUrl = $('p.bm-source a').attr('href') || "";
        const source: Domain = CrawlUtil.buildSourceDomain($('div.article a.source')?.first()?.text()?.trim() || '', sourceUrl);

        const aggregator: Domain = CrawlUtil.buildBaoMoiAggregatorDomain(this.url);

        if (prevData.data) {
            prevData.data.source = source;
            prevData.data.aggregator = aggregator;

            const content = prevData.data.content;
            prevData.data.content = $('div.article__body').html() || content || "";

        }
        return prevData;
    }
}