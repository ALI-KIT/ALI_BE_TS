import { Reliable } from '@core/repository/base/Reliable';
import { BaoMoiTagCrawler } from '@crawler/impl/BaoMoiTagCrawler';
import { BaoMoiTinMoiCrawler } from '@crawler/impl/BaoMoiTinMoiCrawler';
import { Crawler } from './Crawler';

export class CrawlerFactory {
    private static _instance = new CrawlerFactory();
    public static get Instance() { return CrawlerFactory._instance };

    constructor() {

    }

    public findCrawlerBySitemapUrl(site: string): Reliable<Crawler<any>> {
        try {
            const url = new URL(site);
            const baseUrl = url.origin;

            switch (baseUrl) {
                case "https://tuoitre.vn":
                default:
                    return Reliable.Failed("This url is n't supportted yet");
            }
        } catch (e) {
            return Reliable.Failed("Error when finding crawler tool for this url", e);
        }
    }

    public findCrawlerByName(name: string): Crawler<any> | null {
        switch (name) {
            case "bao-moi-tin-moi":
                return new BaoMoiTinMoiCrawler(0, 5);

            default: return null;
        }
    }
}