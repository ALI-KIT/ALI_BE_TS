import { NewsCrawler } from '@crawler/base/NewsCrawler';
import { News } from '@entities/News2';
import cheerio from 'cheerio';
import { BaoMoiXemTinCrawler } from '@crawler/impl/BaoMoiXemTinCrawler';
import { CreateQuery } from 'mongoose';
import { Reliable } from '@core/repository/base/Reliable';

export class BaoMoiTinMoiCrawler extends NewsCrawler {
    private static getBMTMUrl(page: number) {
        //https://baomoi.com/tin-moi/trang1.epi?loadmore=1
        return 'https://baomoi.com/tin-moi/trang' + page + '.epi?loadmore=1'
    }

    public page: number;

    constructor(page: number = 1, piority: number = 5) {
        super(BaoMoiTinMoiCrawler.getBMTMUrl(page), piority);
        this.page = page;
    }


    public getName(): string {
        return 'bao-moi-tin-moi'
    }


    public getDisplayName(): string {
        return 'Báo mới - Tin mới';
    }


    public getBaseUrl(): string {
        return 'https://baomoi.com';
    }


    protected async parseHtml(content: string): Promise<Reliable<CreateQuery<News>>> {

        const $ = cheerio.load(content, { decodeEntities: false });

        const items: string[] = [];
        $('div.story:not(.story--video,.story--photo,.wait-render) a.cache').each((i: number, e: CheerioElement) => {
            items.push(this.baseUrl + $(e).attr('href'));
        });

        for (let value of items) {
            await this.manager?.addNewCrawler(new BaoMoiXemTinCrawler(value, this.priority - 1))
        };

        console.log('tin-moi-bao-moi found ' + items.length + ' new news')

        if (items.length !== 0) {
            console.log('found new loadmore page: ' + this.page++);
            await this.manager?.addNewCrawler(new BaoMoiTinMoiCrawler(this.page++, this.priority));
        }

        return Reliable.Success<CreateQuery<News>>(null);
    }

}