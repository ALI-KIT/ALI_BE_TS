import { Reliable } from '@core/repository/base/Reliable';
import { OpenGraphNewsCrawler } from '@crawler/base/OpenGraphNewsCrawler';
import { Domain } from '@entities/Domain';
import { News } from '@entities/News2';
import CrawlUtil from '@utils/CrawlUtils';
import cheerio from 'cheerio';
import { CreateQuery } from 'mongoose';
import { BaoMoiXemTinCrawler } from './BaoMoiXemTinCrawler';

export class BaoMoiNewsDetailCrawler extends OpenGraphNewsCrawler {

    protected async parseHtmlThen(htmlContent: string, prevData: Reliable<CreateQuery<News>>): Promise<Reliable<CreateQuery<News>>> {
        const $ = cheerio.load(htmlContent, { decodeEntities: false });

        const source: Domain = BaoMoiXemTinCrawler.buildSourceDomain($);
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