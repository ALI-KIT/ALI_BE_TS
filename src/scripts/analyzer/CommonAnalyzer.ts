import { Reliable, Type } from '@core/repository/base/Reliable';
import AppDatabase from '@daos/AppDatabase';
import { AliDbClient } from '@dbs/AliDbClient';
import { DbScript } from '@scripts/DbScript';
import { AnalyzerDocumentData, AnalyzerFieldData, FeedAnalyzer, FetchNewsFeedAnalyzer } from '@scripts/FetchNewsFeedAnalyzer';
import { Readable } from 'stream';

export class GetDefaultKeywords extends DbScript {
    public run(): Promise<Reliable<string[]>> {
        return this.getKeywordsOfDefaultLocation();
    }
    public async getKeywordsOfDefaultLocation(): Promise<Reliable<string[]>> {
        return await this.getKeywordsByLocationCode();
    }

    public async getKeywordsByLocationCode(locationCodes: string[] = []): Promise<Reliable<string[]>> {
        const result: string[] = [];

        /** chúng ta sẽ sử dụng default location nếu location không được cung cấp sẵn */
        if (locationCodes.length == 0) {
            const serverState = await AliDbClient
                .getInstance()
                .useServerConfig()
                .collection("server-state")
                .findOne({ name: "server-common-state" });
            if (serverState && serverState.locationCode && typeof (serverState.locationCode) === 'string') {
                locationCodes.push(serverState.locationCode);
            }
        }

        for (var i = 0; i < locationCodes.length; i++) {
            const location = await AliDbClient
                .getInstance()
                .useServerConfig()
                .collection("server-location-data")
                .findOne({ code: locationCodes[i] });

            if (location && location.keywords && Array.isArray(location.keywords)) {
                const keywords = Array.from(location.keywords);
                keywords.forEach(element => {
                    if (typeof (element) === 'string' && !result.includes(element)) {
                        result.push(element);
                    }
                });
            }
        }

        return Reliable.Success(result);
    }
}

export abstract class KeywordsAnalyzer extends FeedAnalyzer {
    constructor(name: string, private keywords: string[] = null) {
        super(name);
    }
    // override
    async createCursor(): Promise<Reliable<Readable>> {
        const keywordsReliable = await this.getKeywords();
        if (keywordsReliable.type == Type.FAILED || !keywordsReliable.data) {
            return Reliable.Failed("Could not get keywords list");
        }

        const keywords = keywordsReliable.data;
        return await this.createCursorWithProvidedKeywords(keywords);
    }

    async getKeywords(): Promise<Reliable<string[]>> {
        if (this.keywords) {
            return Reliable.Success(this.keywords);
        }

        return new GetDefaultKeywords().run();
    }

    async abstract createCursorWithProvidedKeywords(keywords: string[]): Promise<Reliable<Readable>>;

    async analyzeNewData(old: AnalyzerDocumentData, document: any): Promise<Reliable<AnalyzerDocumentData>> {
        return super.analyzeNewData(old, document);
    }


}

export class FindKeywords_In_Keywords_Analyzer extends KeywordsAnalyzer {
    constructor(keywords: string[] = null) {
        super("find-keywords-in-field-keywords", keywords);
    }
    async createCursorWithProvidedKeywords(keywords: string[]): Promise<Reliable<Readable>> {
        const cursor = AppDatabase.getInstance().news2Dao.model.find(keywords.length == 0 ? {} : { keywords: { $in: keywords } }).cursor()
        return (cursor) ? Reliable.Success(cursor) : Reliable.Failed("Could not create query cursor");
    }

}

export class FindKeywords_In_RawContent_Analyzer extends KeywordsAnalyzer {
    constructor(keywords: string[] = null) {
        super("find-keywords-in-field-rawContent", keywords);
    }
    async createCursorWithProvidedKeywords(keywords: string[]): Promise<Reliable<Readable>> {
        const regexString = "(?i)(" + keywords.join("|") + ")";
        const cursor = AppDatabase.getInstance().news2Dao.model.find({ rawContent: { $regex: regexString } }).cursor()
        return (cursor) ? Reliable.Success(cursor) : Reliable.Failed("Could not create query cursor");
    }

}