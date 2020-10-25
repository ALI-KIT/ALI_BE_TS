import { Reliable } from '@core/repository/base/Reliable';
import { Crawler } from '@crawler/base/Crawler';
import { VnExpressTinMoiRssCrawler } from '@crawler/base/RssCrawler';
import { DantriSitemapCrawler, SitemapNewsCrawler, ThanhNienSitemapCrawler, TuoiTreSitemapCrawler } from '@crawler/base/SitemapNewsCrawler';
import { BaoMoiSitemapCrawler } from './BaoMoiSitemapCrawler';
import { BaoMoiTinMoiCrawler } from './BaoMoiTinMoiCrawler';

export class AliAggregatorCrawler extends Crawler<void> {
    constructor() {
        super("https://tindiaphuong.org", "Tin địa phương");
    }

    public async saveResult(result: void): Promise<Reliable<void>> {
        return Reliable.Success(null);
    }

    public async execute(): Promise<Reliable<void>> {
        if (!this.manager) {
            return Reliable.Failed("The CrawlerManager hasn't been attached to this crawler yet");
        }

        const crawlers = [
            new BaoMoiSitemapCrawler(),
            new VnExpressTinMoiRssCrawler(),
            new BaoMoiTinMoiCrawler(),
            new TuoiTreSitemapCrawler(),
            new ThanhNienSitemapCrawler(),
            new DantriSitemapCrawler()   
        ];

        for (let crawler of crawlers) {
            await this.manager?.addNewCrawler(crawler);
        };

        return Reliable.Success<void>(null);
    }

}