import { Reliable } from '@core/repository/base/Reliable';
import { Crawler } from '@crawler/base/Crawler';
import { SitemapNewsCrawler } from '@crawler/base/SitemapNewsCrawler';
import { BaoMoiTinMoiCrawler } from './BaoMoiTinMoiCrawler';

export class AliAggregatorCrawler extends Crawler<void> {

    public async execute(): Promise<Reliable<void>> {
        if(!this.manager) {
            return Reliable.Failed("The CrawlerManager hasn't been attached to this crawler yet");
        }

        const crawlers = [
            new BaoMoiTinMoiCrawler(0, 5),
            new SitemapNewsCrawler(
                "tuoi-tre-sitemap",
                "Tuổi Trẻ Online", 
                "https://tuoitre.vn",
                "https://tuoitre.vn/Sitemap/GoogleNews.ashx"),
            new SitemapNewsCrawler(
                "zing-news-sitemap",
                "Zing News",
                "https://zingnews.vn",
                "https://zingnews.vn/sitemap/sitemap-news.xml"),
                
        ];

        crawlers.forEach(crawler => {
            this.manager?.addNewCrawler(crawler);
        });

        return Reliable.Success<void>(null);
    }

    public getName(): string {
        return "tin-dia-phuong-common-sitemap";
    }
    
    public getDisplayName(): string {
        throw "Tin Địa Phương";
    }

    public getBaseUrl(): string {
        return "https://tindiaphuong.org";
    }

}