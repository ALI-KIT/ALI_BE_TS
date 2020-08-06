import { NewsCrawler } from '../base/NewsCrawler';
import { News } from '@entities/News2';
import cheerio from 'cheerio';
import { Crawler } from '../base/Crawler';
import { BaoMoiXemTinCrawler } from './BaoMoiXemTinCrawler';
import { CreateQuery } from 'mongoose';

export class BaoMoiTagCrawler extends NewsCrawler {
    
    private static tagRegex : RegExp = /(?<=\/tag\/)(.*)(?=.epi)/;

    private static getBMTagUrl(prettyUrl: string, page: number) : string {
        //https://baomoi.com/tag/%C4%90h-t%C3%A2y-nguy%C3%AAn/trang1.epi?loadmore=1
        const match = this.tagRegex.exec(prettyUrl);
        if(match && match.length > 1) {
        return "https://baomoi.com/tag/"+match[1]+"/trang"+page+".epi?loadmore=1"
        }
        return ''
    }

    public prettyUrl: string;
    public page: number;
    public tag: string;

    constructor(tag: string, prettyUrl: string, page: number, piority: number = 5) {
        super(BaoMoiTagCrawler.getBMTagUrl(prettyUrl, page), piority);
        this.page = page;
        this.prettyUrl = prettyUrl;
        this.tag = tag;
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
            console.log("found new tag page: "+ (this.page++) +" for tag ["+this.tag+"]");
            this.manager?.addNewCrawler(new BaoMoiTagCrawler(this.tag, this.prettyUrl, this.page++, this.priority - 1));
        }

        return null;
    }

}