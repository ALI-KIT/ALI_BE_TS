import { Reliable } from '@core/repository/base/Reliable';
import { SitemapNewsCrawler } from '@crawler/base/SiteMapNewsCrawler';
import { News } from '@entities/News2';
import cheerio from 'cheerio';
import { CreateQuery } from 'mongoose';

export class TuoiTreSitemap extends SitemapNewsCrawler {
    constructor(piority = 5) {
        super("https://tuoitre.vn/Sitemap/GoogleNews.ashx", piority);
    }
    public getName(): string {
        return "tuoi-tre-online-sitemap";
    }
    public getDisplayName(): string {
        return 'Tuổi Trẻ Online';
    }
    public getBaseUrl(): string {
        return "https://tuoitre.vn";
    }

    protected async parseHtml(content: string): Promise<Reliable<CreateQuery<News>>> {
        const $ = cheerio.load(content, {decodeEntities: false, xmlMode: true});

        const items: string[] = [];
        $("url url");

        return Reliable.Success<CreateQuery<News>>(null);
    }

}