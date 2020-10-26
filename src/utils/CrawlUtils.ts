import { Reliable } from '@core/repository/base/Reliable';
import { AliAggregatorDomain, BaoMoiAggregatorDomain, Domain } from '@entities/Domain';
import axios from 'axios';
import cheerio from 'cheerio';
import textversionjs from 'textversionjs';

export default class CrawlUtil {
    public static async loadWebsite(url: string): Promise<string | null> {
        return await axios
            .get(url)
            .then(response => response.data)
            .catch(error => {
                error.status = (error.response && error.response.status) || 500;
                // console.log(error);
                return null;
            });
    }

    public static async loadWebsiteReliable(url: string): Promise<Reliable<string>> {
        try {
            const p = await axios.get(url);
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

    public static getRawTextContent(content: string) {
        const imgProcess: textversionjs.imgProcess = (src: any, alt: any) => "";
        const text = textversionjs(content, { imgProcess })
        return text;
    }

    public static async buildBaoMoiAggregatorDomain(url: string): Promise<Domain> {
        return new BaoMoiAggregatorDomain(url);
    }

    public static async buildAliAggregatorDomain(url: string = ""): Promise<Domain> {
        return (url == "") ? new AliAggregatorDomain() : new AliAggregatorDomain(url);
    }

    public static async buildSourceDomain(displayName: string, sourceUrl: string): Promise<Domain> {
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
