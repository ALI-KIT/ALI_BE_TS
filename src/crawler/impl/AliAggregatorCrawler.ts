import { Reliable } from '@core/repository/base/Reliable';
import { Crawler } from '@crawler/base/Crawler';
import { DantriSitemapCrawler, SitemapNewsCrawler, ThanhNienSitemapCrawler, TuoiTreSitemapCrawler } from '@crawler/base/SitemapNewsCrawler';
import { BaoMoiTinMoiCrawler } from './BaoMoiTinMoiCrawler';

export class AliAggregatorCrawler extends Crawler<void> {
    constructor() {
        super("https://tindiaphuong.org");
    }

    public async execute(): Promise<Reliable<void>> {
        if(!this.manager) {
            return Reliable.Failed("The CrawlerManager hasn't been attached to this crawler yet");
        }

        const crawlers = [
           // new BaoMoiTinMoiCrawler(0, 5),
           new TuoiTreSitemapCrawler(),
           new ThanhNienSitemapCrawler(),
           //new DantriSitemapCrawler()   
        ];

        crawlers.forEach(crawler => {
            this.manager?.addNewCrawler(crawler);
        });

        return Reliable.Success<void>(null);
    }

    public getName(): string {
        return "tin-dia-phuong";
    }
    
    public getDisplayName(): string {
        return "Tin địa phương";
    }

    public getBaseUrl(): string {
        return "https://tindiaphuong.org";
    }

}