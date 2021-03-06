import { Reliable, Type } from '@core/repository/base/Reliable';
import Sitemapper from 'sitemapper';
import { Crawler } from './Crawler';
import { DynamicSourceOGNewsCrawler} from './OpenGraphNewsCrawler';

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


        try {
            const sitemapper = new Sitemapper({
                url: url,
                timeout: 1000 * 60 * 45
            })

            const response = await sitemapper.fetch();
            const data = response ? response.sites : [];
            return Reliable.Success(data);
        } catch (e) {
            return Reliable.Failed("Error when fetching url [" + url + "]", e);
        }

    }

    protected abstract parseSiteMap(sitemaps: string[]): Promise<Reliable<T>>;
}

export abstract class SitemapNewsCrawler extends SitemapCrawler<string[]> {

    /**
     * Add các crawler tương ứng với mỗi sitemap url
     * @param sitemaps 
     */
    protected abstract parseSiteMap(sitemaps: string[]): Promise<Reliable<string[]>>;

    public async saveResult(data: string[]): Promise<Reliable<string[]>> {
        return Reliable.Success(data);
    }
}

export class DynamicSourceSitemapCrawler extends SitemapNewsCrawler {
    protected async parseSiteMap(sitemaps: string[]): Promise<Reliable<string[]>> {
        for (const url of sitemaps) {
            const crawler = new DynamicSourceOGNewsCrawler(url);
            crawler.priority = this.priority;
            await this.manager?.addNewCrawler(crawler);
        }
        return Reliable.Success(sitemaps);
    }

}