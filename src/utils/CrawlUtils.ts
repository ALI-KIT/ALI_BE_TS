import { Reliable } from '@core/repository/base/Reliable';
import { AliAggregatorDomain, BaoMoiAggregatorDomain, Domain } from '@entities/Domain';
import axios from 'axios';
import cheerio from 'cheerio';
import textversionjs, { styleConfig } from 'textversionjs';

export default class CrawlUtil {
    public static async loadWebsite(url: string): Promise<string | null> {
        return await axios
            .get(url)
            .then(response => response.data)
            .catch(error => {
                error.status = (error.response && error.response.status) || 500;
                // LogUtil.consoleLog(error);
                return null;
            });
    }

    public static async loadWebsiteReliable(url: string): Promise<Reliable<string>> {
        try {
            const p = await axios.get(url, {
                headers: {
                    'User-Agent': 'Googlebot-News',
                    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
                }
            });
            if (!p.data) {
                return Reliable.Failed("Error when loading website [" + url + "]. Status code " + p.status);
            } else return Reliable.Success<string>(p.data);

        } catch (e) {
            return Reliable.Failed<string>("Error when loading website [" + url + "]. ", e);
        }
    }


    public static async loadWebsiteWithCheerIo(url: string): Promise<any> {
        return await axios
            .get(url)
            .then(response => cheerio.load(response.data, { decodeEntities: false }))
            .catch(error => {
                error.status = (error.response && error.response.status) || 500;
                throw error;
            });
    }

    public static prettyUrl(url: string): Reliable<string> {
        try {
            const result = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0] || "";
            return Reliable.Success(result);
        } catch (e) {
            return Reliable.Failed("Error when trying to get pretty url of [" + url + "]", e);
        }
    }

    public static baseUrl(url: string): Reliable<string> {
        try {
            const result = new URL(url);
            return Reliable.Success(result.origin);
        } catch (e) {
            return Reliable.Failed("Error when trying to get base url of [" + url + "]", e);
        }
    }

    private static styleConfig: styleConfig = {
        imgProcess: (src: string, alt: string) => "\n",
        linkProcess: (href: string, linkText: string) => " ",
        oIndentionChar: " ",
        uIndentionChar: " ",
        headingStyle: "linebreak",
    }

    public static getRawTextContent(content: string) {
        const text = textversionjs(content, CrawlUtil.styleConfig);
        const text2 = text.replace(/<h([1-6])[^>]*>([^<]*)<\/h\1>/gi, "\n").normalize().replace(/[\r\n]{2,}/g, "\n").trim();
        return text2;
    }

    public static buildBaoMoiAggregatorDomain(url: string): Domain {
        return new BaoMoiAggregatorDomain(url);
    }

    public static buildAliAggregatorDomain(url: string = ""): Domain {
        return (url == "") ? new AliAggregatorDomain() : new AliAggregatorDomain(url);
    }

    public static buildSourceDomain(displayName: string, sourceUrl: string): Domain {
        const prettyUrl = CrawlUtil.prettyUrl(sourceUrl).data || "";
        const baseUrl = CrawlUtil.baseUrl(sourceUrl).data || "";

        const source: Domain = {
            name: prettyUrl,
            baseUrl: baseUrl,
            displayName: displayName,
            url: sourceUrl
        }
        return source;
    }
}

