import { Reliable, Type } from '@core/repository/base/Reliable';
import Sitemapper from 'sitemapper';
import { Crawler } from './Crawler';
import { CrawlerFactory } from './CrawlerFactory';
import { ICrawlerManager } from './CrawlerManager';
import { DanTriNewsDetailCrawler, ThanhNienNewsDetailCrawler, TuoiTreNewsDetailCrawler } from './OpenGraphNewsCrawler';

export abstract class SitemapCrawler<T> extends Crawler<T> {
    public async execute(): Promise<Reliable<T>> {
        const url = this.url;

        /* step: fetch sitemap list */
        const fetchSitemapReliable = await this.fetchSitemapHtml(url);
        if (fetchSitemapReliable.type == Type.FAILED) {
            return Reliable.Failed<T>(fetchSitemapReliable.message, fetchSitemapReliable.error ? fetchSitemapReliable.error! : undefined);
        } else if (!fetchSitemapReliable.data) {
            /* success but no data */
            return Reliable.Success<T>(null);
        }

        /* step what you will do with these sitemaps */
        const parseSitemapReliable = await this.parseSiteMap(fetchSitemapReliable.data!);
        return parseSitemapReliable;
    }

    protected async fetchSitemapHtml(url: string): Promise<Reliable<string[]>> {
        const sitemapper = new Sitemapper({
            url
        })

        try {
            const response = await sitemapper.fetch();
            const data = response ? response.sites : [];
            return Reliable.Success(data);
        } catch (e) {
            return Reliable.Failed("Error when fetching url [" + url + "]", e);
        }

    }

    protected async abstract parseSiteMap(sitemaps: string[]): Promise<Reliable<T>>;
}

export class SitemapNewsCrawler extends SitemapCrawler<string[]> {

    /**
     * Add các crawler tương ứng với mỗi sitemap url
     * @param sitemaps 
     */
    protected async parseSiteMap(sitemaps: string[]): Promise<Reliable<string[]>> {
        for (const site in sitemaps) {
            const reliable = CrawlerFactory.Instance.findCrawlerBySitemapUrl(site);
            if (reliable.type == Type.SUCCESS && reliable.data) {
                await this.manager?.addNewCrawler(reliable.data!);
            }
        };
        return Reliable.Success(sitemaps);
    }

    public async saveResult(data: string[]): Promise<Reliable<string[]>> {
        return Reliable.Success(data);
    }
}

export class TuoiTreSitemapCrawler extends SitemapNewsCrawler {
    constructor() {
        super("tuoi-tre-sitemap",
            "Tuổi Trẻ Online");
    }

    protected async parseSiteMap(data: string[]): Promise<Reliable<string[]>> {
        for (const url of data) {
            await this.manager?.addNewCrawler(new TuoiTreNewsDetailCrawler(url));
        };
        return Reliable.Success<string[]>(data);
    }
}

/* export class VnExpressSitemapCrawler extends SitemapNewsCrawler {
    constructor() {
        super(  "tuoi-tre-sitemap",
        "Tuổi Trẻ Online", 
        "https://tuoitre.vn",
        "https://tuoitre.vn/Sitemap/GoogleNews.ashx");
    }
} */

export class ThanhNienSitemapCrawler extends SitemapNewsCrawler {
    constructor() {
        super("thanh-nien-sitemap",
            "Thanh Niên");
    }

    protected async parseSiteMap(data: string[]): Promise<Reliable<string[]>> {
        for (const url of data) {
            await this.manager?.addNewCrawler(new ThanhNienNewsDetailCrawler(url));
        }
        return Reliable.Success<string[]>(data);
    }
}

export class DantriSitemapCrawler extends SitemapNewsCrawler {
    constructor() {
        super("tuoi-tre-sitemap",
            "Tuổi Trẻ Online");
    }

    protected async parseSiteMap(data: string[]): Promise<Reliable<string[]>> {
        for (const url of data) {
            await this.manager?.addNewCrawler(new DanTriNewsDetailCrawler(url));
        };
        return Reliable.Success<string[]>(data);
    }
}