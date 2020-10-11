import { Reliable, Type } from '@core/repository/base/Reliable';
import { Domain } from '@entities/Domain';
import { Local } from '@entities/Local';
import { News } from '@entities/News2';
import Axios from 'axios';
import cheerio from 'cheerio';
import { TYPE } from 'inversify-express-utils';
import { CreateQuery } from 'mongoose';
import { domain, title } from 'process';
import { Crawler } from './Crawler';
import { ICrawlerManager } from './CrawlerManager';
import { NewsCrawler } from './NewsCrawler';
import { Readability } from "@mozilla/readability";
import { JSDOM } from 'jsdom';
import { extract } from 'article-parser';
import CrawlUtil from '@utils/crawlUtils';

export class OGNewsParser {

    private async extractSections(crawer: Crawler<any>, $: CheerioStatic, htmlContent: string): Promise<Reliable<string[]>> {
        const result: string[] = [];
        const section = $('meta[property="article\\:section"]')?.attr('content');
        if (section) {
            result.push(section);
        }

        let subSection = $('meta[property="article\\:subsection"]')?.attr('content');
        if (!subSection) {
            let index = 2;
            do {
                subSection = $('meta[property="article\\:section' + index + '"]')?.attr('content');
                if (subSection) {
                    result.push(subSection);
                    index++;
                }
            } while (subSection)
        }
        return Reliable.Success(result);
    }

    private async extractKeywords(crawer: Crawler<any>, $: CheerioStatic, htmlContent: string): Promise<Reliable<string[]>> {
        const result: string[] = [];
        const keywordContent: string[] = [];

        // <meta property="article:tag" content="aa,ere"
        $('meta[property="article\\:tag"]')?.each((index, element) => {
            const tag = $(element).attr('content');
            if (tag) {
                keywordContent.push(tag);
            }
        });

        // <meta name="keywords" content="aa, ere"
        $('meta[name="keywords"]')?.each((index, element) => {
            const tag = $(element).attr('content');
            if (tag) {
                keywordContent.push(tag);
            }
        });

        // <meta name="news_keywords" content="aa, ere"
        $('meta[name="news_keywords"]')?.each((index, element) => {
            const tag = $(element).attr('content');
            if (tag) {
                keywordContent.push(tag);
            }
        })

        // split keywords content then add to list
        keywordContent.forEach(item => {
            const keywords = item.split(new RegExp('[,;\n]', 'g'));
            keywords.forEach(keyword => {
                const trimmedKeyword = keyword.trim();
                if (trimmedKeyword && !result.includes(trimmedKeyword)) {
                    result.push(trimmedKeyword);
                }
            })
        });

        return Reliable.Success(result);
    }

    public async execute(crawler: Crawler<any>, htmlContent: string): Promise<Reliable<CreateQuery<News>>> {
        try {
            return await this.executeInternal(crawler, htmlContent);
        } catch (e) {
            return Reliable.Failed("Error when trying to parse the html by the OpenGraphNewsParser", e);
        }
    }

    private async executeInternal(crawler: Crawler<any>, htmlContent: string): Promise<Reliable<CreateQuery<News>>> {
        const $ = cheerio.load(htmlContent, { decodeEntities: false });

        const title = $('meta[property="og\\:title"]')?.first()?.attr('content') || $('meta[name=\'title\']')?.first()?.attr('content') || "";
        const summary = $('meta[property="og\\:description"]')?.first()?.attr('content') || $('meta[name=\'description\']')?.first()?.attr('content') || "";

        var articleParserData;
        try {
            articleParserData = await extract(htmlContent);
        } catch (e) {
            articleParserData = null;
        };

        const shouldParseWithMozillaReadability: boolean = !articleParserData;
        const mozillaReadabilityArticle = (shouldParseWithMozillaReadability) ? new Readability(new JSDOM(htmlContent).window.document).parse() : null;
        const content = articleParserData?.content || mozillaReadabilityArticle?.content || "";
        const rawContent = CrawlUtil.getRawTextContent(content);

        const crawlDate = new Date(Date.now());
        const pDString = $('meta[property="article\\:published_time"]')?.attr('content');
        const publicationDate = new Date(pDString || Date.now());

        const thumbnail = $('meta[property="og\\:image"]')?.first()?.attr('content') || $('meta[itemprop=\'image\']')?.first()?.attr('content') || articleParserData?.image || "";

        const aggregator: Domain = {
            name: 'tin-dia-phuong',
            baseUrl: "https://tindiaphuong.org",
            displayName: 'Tin địa phương',
            url: 'https://tindiaphuong.org'
        };
        const source: Domain = {
            name: crawler.name,
            baseUrl: crawler.baseUrl,
            displayName: crawler.displayName,
            url: crawler.url
        }

        const categoriesReliable = await this.extractSections(crawler, $, htmlContent);
        const categories = categoriesReliable.data || [];

        const keywordsReliable = await this.extractKeywords(crawler, $, htmlContent);
        const keywords = keywordsReliable.data || [];
        const locals: Local[] = [];

        return Reliable.Success({
            title,
            summary,
            content,
            rawContent,
            thumbnail,
            crawlDate,
            publicationDate,
            aggregator,
            source,
            keywords,
            categories,
            locals
        });
    }
}

export abstract class OpenGraphNewsCrawler extends NewsCrawler {

    protected async parseHtml(htmlContent: string): Promise<Reliable<CreateQuery<News>>> {
        const ogpData = await new OGNewsParser().execute(this, htmlContent);
        /*  const data: CreateQuery<News> = {
             title: prevData.data?.title || ogpData.data?.title || "",
             summary: prevData.data?.summary || ogpData.data?.summary || "",
             content: prevData.data?.content || ogpData.data?.content || '',
             thumbnail: prevData.data?.thumbnail || ogpData.data?.thumbnail || '',
             crawlDate: prevData.data?.crawlDate || ogpData.data?.crawlDate || new Date(Date.now()),
             publicationDate: prevData.data?.crawlDate || ogpData.data?.crawlDate || 0,
             aggregator: prevData.data?.aggregator || ogpData.data!.aggregator,
             source: prevData.data?.source || ogpData.data!.source,
             keywords: [],
             categories: [],
             locals: []
         } */
        return await this.parseHtmlThen(htmlContent, ogpData);
    }

    /**
     * Chỉnh sửa, cập nhật kết quả sau khi được tạo ra tự động từ OpenGraphProtocol News Parser trong hàm này
     */
    protected async parseHtmlThen(htmlContent: string, prevData: Reliable<CreateQuery<News>>): Promise<Reliable<CreateQuery<News>>> {
        return prevData;
    }
}

export class SimpleOpenGraphNewsCrawler extends OpenGraphNewsCrawler {
    constructor(private _name: string, private _displayName: string, private _baseUrl: string, url: string, piority: number = 5, manager?: ICrawlerManager) {
        super(url, piority, manager);
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

export class TuoiTreNewsDetailCrawler extends OpenGraphNewsCrawler {
    public getName(): string {
        return "tuoi-tre-online";
    }
    public getDisplayName(): string {
        return "Tuổi Trẻ Online";
    }
    public getBaseUrl(): string {
        return "https://tuoitre.vn";
    }
}

export class VnExpressNewsDetailCrawler extends OpenGraphNewsCrawler {
    public getName(): string {
        return "vnexpress";
    }
    public getDisplayName(): string {
        return "VnExpress";
    }
    public getBaseUrl(): string {
        return "https://vnexpress.net";
    }
}

export class ThanhNienNewsDetailCrawler extends OpenGraphNewsCrawler {
    public getName(): string {
        return "thanh-nien";
    }
    public getDisplayName(): string {
        return "Thanh Niên";
    }
    public getBaseUrl(): string {
        return "https://thanhnien.vn";
    }
}

export class DanTriNewsDetailCrawler extends OpenGraphNewsCrawler {
    public getName(): string {
        return "dan-tri";
    }
    public getDisplayName(): string {
        return "Báo Dân trí";
    }
    public getBaseUrl(): string {
        return "https://dantri.com.vn";
    }
}