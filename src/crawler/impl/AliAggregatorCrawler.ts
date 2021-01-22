import { Reliable, Type } from '@core/repository/base/Reliable';
import { Crawler } from '@crawler/base/Crawler';
import { VnExpressTinMoiRssCrawler } from '@crawler/base/RssCrawler';
import { DantriSitemapCrawler, SitemapNewsCrawler, ThanhNienSitemapCrawler, TuoiTreSitemapCrawler } from '@crawler/base/SitemapNewsCrawler';
import { DynamicNewsSourceGetter } from '@crawler/interactor/DynamicNewsSourceGetter';
import { BaoMoiSitemapCrawler } from './BaoMoiSitemapCrawler';
import { BaoMoiTinMoiCrawler } from './BaoMoiTinMoiCrawler';
import DynamicNewsSourceGetterCrawler from './DynamicSourceGetterCrawler';

export class AliAggregatorCrawler extends Crawler<any> {
    constructor() {
        super("https://tindiaphuong.org", "Tin địa phương");
    }

    public async saveResult(result: any): Promise<Reliable<any>> {
        return Reliable.Success(result);
    }

    public async execute(): Promise<Reliable<any>> {
        if (!this.manager) {
            return Reliable.Failed("The CrawlerManager hasn't been attached to this crawler yet");
        }

        const crawlers: Crawler<any>[] = [

            new BaoMoiTinMoiCrawler(),
            new DynamicNewsSourceGetterCrawler(false, [])
            //new BaoMoiSitemapCrawler(),
            //new VnExpressTinMoiRssCrawler(),
            //new TuoiTreSitemapCrawler(),
            //new ThanhNienSitemapCrawler(),
            //new DantriSitemapCrawler()
        ];

        // add all dynamic sources
        const dynamicSourceCrawlerReliable = await new DynamicNewsSourceGetter().run();
        if (dynamicSourceCrawlerReliable.type == Type.SUCCESS && dynamicSourceCrawlerReliable.data) {
            dynamicSourceCrawlerReliable.data!.forEach(dsc => crawlers.push(dsc));
        }

        for (let crawler of crawlers) {
            await this.manager?.addNewCrawler(crawler);
        };

        return Reliable.Success<any>(null);
    }

}