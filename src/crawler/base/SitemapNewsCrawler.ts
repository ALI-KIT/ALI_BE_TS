import { CreateQuery } from 'mongoose';
import { NewsCrawler } from './NewsCrawler';
import { News } from '@entities/News2';
import Sitemapper from 'sitemapper';

export abstract class SiteMapNewsCrawler extends NewsCrawler {
    constructor(url: string, piority: number = 5) {
        super(url, piority);
    }

    async parseHtml(html: string): Promise<CreateQuery<News> | null> {
        const sitemap = new Sitemapper({
            
        });
        return null;
    }
}