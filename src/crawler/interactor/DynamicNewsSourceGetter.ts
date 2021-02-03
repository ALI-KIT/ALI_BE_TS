import { Reliable, Type } from '@core/repository/base/Reliable';
import { Crawler } from '@crawler/base/Crawler';
import { DynamicSourceRssCrawler, RssCrawler } from '@crawler/base/RssCrawler';
import { DynamicSourceSitemapCrawler } from '@crawler/base/SitemapNewsCrawler';
import { MongoDbCrawlerClient } from '@daos/MongoDbCrawlerClient';
import { DbScript } from '@scripts/DbScript';
import { stat } from 'fs';

/**
 * Truy cập server database và lấy về các dynamic crawler
 */
export enum SourceStatus {
    ENABLED,
    DISABLED,
    INVALID
}

export enum SourceType {
    RSS,
    SITEMAP,
    INVALID
}

export class DynamicSource {
    constructor(
        public readonly displayName: string,
        public readonly url: string,
        public readonly type: SourceType,// rss, sitemap
        public readonly status: SourceStatus,
        public readonly priority: number = 5) { }

    public static refine(raw: any): DynamicSource | null {
        const displayName = raw.displayName || "";
        const type = DynamicSource.parseType(raw.type);
        const status = DynamicSource.parseStatus(raw.status);
        const url = raw.url || "";
        const priority: number = raw.priority || 5;
        if (type != SourceType.INVALID && status != SourceStatus.INVALID && url != "") {
            return new DynamicSource(displayName, url, type, status, priority);
        } else {
            return null;
        }
    }

    public static parseType(type: string | null): SourceType {

        if (type) {
            switch (type) {
                case "rss": return SourceType.RSS;
                case "sitemap": return SourceType.SITEMAP;
            }
        }
        return SourceType.INVALID;

    }

    public static parseStatus(status: string | null): SourceStatus {
        if (status) {
            switch (status) {
                case "enabled": return SourceStatus.ENABLED;
                case "disabled": return SourceStatus.DISABLED;
            }
        }
        return SourceStatus.INVALID;
    }

    public static toStringType(type: SourceType): string {
        switch (type) {
            case SourceType.RSS: return "rss";
            case SourceType.SITEMAP: return "sitemap";
            default: return "";
        }
    }

    public static toStringStatus(status: SourceStatus): string {
        switch (status) {
            case SourceStatus.ENABLED: return "enabled";
            case SourceStatus.DISABLED: return "disabled";
            default: return "";
        }
    }
}

export class DynamicNewsSourceGetter extends DbScript<Crawler<any>[]> {
    protected async runInternal(): Promise<Reliable<Crawler<any>[]>> {
        const dynamicSourceReliable = await this.getAllDynamicNewsSources();
        if (dynamicSourceReliable.type == Type.FAILED) {
            return Reliable.Failed(dynamicSourceReliable.message, dynamicSourceReliable.error || undefined);
        } else if (!dynamicSourceReliable.data) {
            return Reliable.Failed("Null dynamic sources data");
        }

        return await this.getAvailableCrawler(dynamicSourceReliable.data!);
    }

    private async getAllDynamicNewsSources(): Promise<Reliable<DynamicSource[]>> {
        const list: DynamicSource[] = [];
        const collection = (await MongoDbCrawlerClient.waitInstance()).useServerConfig().collection("dynamic-news-sources");

        const raws = await collection.find({}).sort({ priority: -1 }).toArray();

        raws.forEach(raw => {
            const ds = DynamicSource.refine(raw);
            if (ds) {
                list.push(ds);
            }
        });

        return Reliable.Success(list);
    }

    private async getAvailableCrawler(dynamicSources: DynamicSource[]): Promise<Reliable<Crawler<any>[]>> {
        // we will instantiate crawlers
        // but only enabled crawler
        const list: Crawler<any>[] = [];
        dynamicSources.forEach(ds => {
            const c = DynamicNewsSourceGetter.instantiateCrawler(ds);
            if (c && ds.status != SourceStatus.INVALID) {
                list.push(c);
            }
        });

        return Reliable.Success(list);
    }

    public static instantiateCrawler(dynamicSource: DynamicSource): Crawler<any> | null {
        if (dynamicSource.status == SourceStatus.DISABLED) {
            return null;
        }

        switch (dynamicSource.type) {
            case SourceType.RSS: {
                const crawler = new DynamicSourceRssCrawler(dynamicSource.url, dynamicSource.displayName);
                crawler.priority = dynamicSource.priority;
                return crawler;
            }
            case SourceType.SITEMAP: {
                const crawler = new DynamicSourceSitemapCrawler(dynamicSource.url, dynamicSource.displayName);
                crawler.priority = dynamicSource.priority;
                return crawler;
            }
        }

        return null;
    }
}