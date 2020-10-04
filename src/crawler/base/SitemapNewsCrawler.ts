import { Reliable, Type } from '@core/repository/base/Reliable';
import Sitemapper from 'sitemapper';
import { Crawler } from './Crawler';
import { CrawlerFactory } from './CrawlerFactory';
import { ICrawlerManager } from './CrawlerManager';

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
        if (parseSitemapReliable.type == Type.FAILED) {
            return Reliable.Failed<T>(parseSitemapReliable.message, parseSitemapReliable.error ? parseSitemapReliable.error! : undefined);
        } else if (!parseSitemapReliable.data) {
            /* success but no data */
            return Reliable.Success<T>(null);
        }

        /* step: save data to database */
        const saveDataReliable = await this.saveResult(parseSitemapReliable.data!);
        return saveDataReliable;
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
    public async abstract saveResult(data: T): Promise<Reliable<T>>;
}

export class SitemapNewsCrawler extends SitemapCrawler<string[]> {
    constructor(private _name: string, private _displayName: string, private _baseUrl: string, url: string, piority: number = 5, manager?: ICrawlerManager) {
        super(url, piority, manager);
    }

    /**
     * Add các crawler tương ứng với mỗi sitemap url
     * @param sitemaps 
     */
    protected async parseSiteMap(sitemaps: string[]): Promise<Reliable<string[]>> {
        sitemaps.forEach(site => {
            const reliable = CrawlerFactory.Instance.findCrawlerBySitemapUrl(site);
            if (reliable.type == Type.SUCCESS && reliable.data) {
                this.manager?.addNewCrawler(reliable.data!);
            }
        });
        return Reliable.Success(sitemaps);
    }

    public async saveResult(data: string[]): Promise<Reliable<string[]>> {
        return Reliable.Success<string[]>(data);
    }

    public getName(): string {
        return this._name;
    }
    public getDisplayName(): string {
        return this._displayName;
    }
    public getBaseUrl(): string {
        return this._baseUrl;
    }

}