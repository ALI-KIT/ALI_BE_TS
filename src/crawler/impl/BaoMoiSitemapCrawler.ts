import { Reliable, Type } from '@core/repository/base/Reliable';
import { SitemapNewsCrawler } from '@crawler/base/SitemapNewsCrawler';
import CrawlUtil from '@utils/CrawlUtils';
import cheerio from 'cheerio';
import { BaoMoiNewsDetailCrawler } from './BaoMoiNewsDetailCrawler';

export class BaoMoiSitemapCrawler extends SitemapNewsCrawler {
    constructor() {
        super("https://baomoi.com/sitemaps/sitemap.xml", "Báo mới");
    }

    protected async fetchSitemapHtml(url: string): Promise<Reliable<string[]>> {
        const htmlContent = await CrawlUtil.loadWebsiteReliable(url);

        if (htmlContent.type == Type.FAILED || !htmlContent.data) {
            return Reliable.Failed(htmlContent.message, htmlContent.error|| undefined);
        }

        let $ = cheerio.load(htmlContent.data, { xmlMode: true })
        const locs = $("loc");
        const links: string[] = [];
        try {
            const link = locs.length >= 2 ? $(locs[1]).text() : "";
            if (link) links.push(link);
        } catch (e) { }

        try {
            const link = locs.length >= 3 ? $(locs[2]).text() : "";
            if (link) links.push(link);
        } catch (e) { }

        if (links.length == 0) {
            return Reliable.Failed("Could not get sitemap");
        }

        const result: string[] = [];

        for (const link of links) {
            const reliable = await this.fetchChildSitemap(link);
            if (reliable.type == Type.SUCCESS && reliable.data) {
                reliable.data.forEach(item => {
                    if (!result.includes(item)) {
                        result.push(item);
                    }
                })
            } else {
                return Reliable.Failed(reliable.message, reliable.error || undefined);
            }
        }

        return Reliable.Success(result);
    }

    private async fetchChildSitemap(url: string): Promise<Reliable<string[]>> {
        const sitemapContent = await CrawlUtil.loadWebsiteReliable(url);
        if (sitemapContent.type == Type.FAILED || !sitemapContent.data) {
            return Reliable.Failed(sitemapContent.message, sitemapContent.error||undefined);
        }

        const $ = cheerio.load(sitemapContent.data);
        const result: string[] = []
        $("loc").each((index, element) => {
            const url = $(element).text();
            if (url) result.push(url);
        });

        return Reliable.Success(result);
    }

    protected async parseSiteMap(sitemaps: string[]): Promise<Reliable<string[]>> {
        for (const url of sitemaps) {
            await this.manager?.addNewCrawler(new BaoMoiNewsDetailCrawler(url));
        };
        return Reliable.Success<string[]>(sitemaps);
    }
}