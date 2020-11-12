import { Reliable, Type } from '@core/repository/base/Reliable';
import { Local } from '@entities/Local';
import { News } from '@entities/News2';
import cheerio from 'cheerio';
import { CreateQuery } from 'mongoose';
import { Crawler } from './Crawler';
import { ICrawlerManager } from './CrawlerManager';
import { NewsCrawler } from './NewsCrawler';
import { Readability } from "@mozilla/readability";
import { JSDOM } from 'jsdom';
import { extract } from 'article-parser';
import CrawlUtil from '@utils/CrawlUtils';
import { Domain } from '@entities/Domain';

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
        const siteName = $('meta[property="og\\:site_name"]')?.first()?.attr('content') || "";

        var articleParserData: any;
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


        const sourceUrl = crawler.url;
        const aggregator = CrawlUtil.buildAliAggregatorDomain(crawler.url);

        const source = CrawlUtil.buildSourceDomain(siteName || crawler.displayName, sourceUrl);

        const categoriesReliable = await this.extractSections(crawler, $, htmlContent);
        const categories = categoriesReliable.data || [];

        const keywordsReliable = await this.extractKeywords(crawler, $, htmlContent);
        const keywords = keywordsReliable.data || [];
        const locals: Local[] = [];

        if (title == "" || summary == "") {
            return Reliable.Failed("Couldn't get title or summary from this article");
        }

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

/**
 * Just receive a url
 * Load that url and try to get the news detail
 */
export class DynamicSourceOGNewsCrawler extends OpenGraphNewsCrawler { }

export class TuoiTreNewsDetailCrawler extends OpenGraphNewsCrawler {
    constructor(url: string) {
        super(url, "Tuổi Trẻ Online");
    }
}

export class VnExpressNewsDetailCrawler extends OpenGraphNewsCrawler {
    constructor(url: string) {
        super(url, "VnExpress");
    }
}

export class ThanhNienNewsDetailCrawler extends OpenGraphNewsCrawler {
    constructor(url: string) {
        super(url, "Báo Thanh niên");
    }
}

export class DanTriNewsDetailCrawler extends OpenGraphNewsCrawler {
    constructor(url: string) {
        super(url, "BáoBáo Dân trí");
    }
}