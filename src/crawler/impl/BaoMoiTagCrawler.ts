import { NewsCrawler } from '@crawler/base/NewsCrawler';
import { News } from '@entities/News2';
import cheerio from 'cheerio';
import { BaoMoiXemTinCrawler } from '@crawler/impl/BaoMoiXemTinCrawler';
import { CreateQuery } from 'mongoose';
import { Reliable } from '@core/repository/base/Reliable';
import LoggingUtil from '@utils/LogUtil';

export class BaoMoiTagCrawler extends NewsCrawler {

    private static tagRegex: RegExp = /(?<=\/tag\/)(.*)(?=.epi)/;

    private static getBMTagUrl(prettyUrl: string, page: number): string {
        //https://baomoi.com/tag/%C4%90h-t%C3%A2y-nguy%C3%AAn/trang1.epi?loadmore=1
        const match = this.tagRegex.exec(prettyUrl);
        if (match && match.length > 1) {
            return 'https://baomoi.com/tag/' + match[1] + '/trang' + page + '.epi?loadmore=1'
        }
        return ''
    }

    public prettyUrl: string;
    public page: number;
    public tag: string;

    constructor(tag: string, prettyUrl: string, page: number, priority: number = 5) {
        super(BaoMoiTagCrawler.getBMTagUrl(prettyUrl, page));
        this.page = page;
        this.priority = priority;
        this.prettyUrl = prettyUrl;
        this.tag = tag;
    }
    
    async parseHtml(html: string): Promise<Reliable<CreateQuery<News>>> {

        const $ = cheerio.load(html, { decodeEntities: false });

        const items: string[] = [];
        $('div.story:not(.story--video,.story--photo,.wait-render) a.cache').each((i: number, e: CheerioElement) => {
            items.push(this.baseUrl + $(e).attr('href'));
        });

        for (let item of items) {
            const c = new BaoMoiXemTinCrawler(item);
            c.priority = this.priority - 1;
            await this.manager?.addNewCrawler(c);
        }

        //LogUtil.consoleLog('tin-moi-bao-moi found '+ items.length+' new news')

        if (items.length !== 0) {
            LoggingUtil.consoleLog('found new tag page: ' + (this.page++) + ' for tag [' + this.tag + ']');
            await this.manager?.addNewCrawler(new BaoMoiTagCrawler(this.tag, this.prettyUrl, this.page++, this.priority - 1));
        }

        return Reliable.Success<CreateQuery<News>>(null);
    }

}