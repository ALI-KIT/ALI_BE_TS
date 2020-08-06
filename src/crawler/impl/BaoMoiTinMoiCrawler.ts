import { NewsCrawler } from '../base/NewsCrawler';
import { News } from '@entities/News2';
import cheerio from 'cheerio';
import { Crawler } from '../base/Crawler';
import { BaoMoiXemTinCrawler } from './BaoMoiXemTinCrawler';
import { CreateQuery } from 'mongoose';

export class BaoMoiTinMoiCrawler extends NewsCrawler {
    private static getBMTMUrl(page: number) {
        //https://baomoi.com/tin-moi/trang1.epi?loadmore=1
        return "https://baomoi.com/tin-moi/trang"+page+".epi?loadmore=1"
    }

    public page: number;

    constructor(page: number, piority: number = 5) {
        super(BaoMoiTinMoiCrawler.getBMTMUrl(page), piority);
        this.page = page;
    }
    public getName(): string {
        return "bao-moi-tin-moi"
    }
    public getDisplayName(): string {
        return "Báo mới - Tin mới";
    }
    public getBaseUrl(): string {
        return "https://baomoi.com";
    }

    async parseHtml(html: string): Promise<CreateQuery<News> | null> {

        const $ = cheerio.load(html, { decodeEntities: false });

        const items: string[] = [];
        $('div.story:not(.story--video,.story--photo,.wait-render) a.cache').each((i: number, e: CheerioElement) => {
            items.push(this.baseUrl + $(e).attr('href'));
        });

        items.forEach(
            (value: string) => this.manager?.addNewCrawler(new BaoMoiXemTinCrawler(value, this.priority - 1))
        );

        console.log("tin-moi-bao-moi found "+ items.length+" new news")

        if(items.length != 0) {
            console.log("found new loadmore page: "+ this.page++);
            this.manager?.addNewCrawler(new BaoMoiTinMoiCrawler(this.page++, this.priority - 1));
        }

        return null;
    }

}