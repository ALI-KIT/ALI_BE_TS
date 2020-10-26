import { Reliable, Type } from '@core/repository/base/Reliable';
import AppDatabase from '@daos/AppDatabase';
import { AliDbClient } from '@dbs/AliDbClient';
import { DbScript } from '@scripts/DbScript';
import { KeywordsUtil } from '@utils/KeywordsUtil';
import { Readable } from 'stream';
import { AnalyzerDocumentData, FeedAnalyzer } from './FeedAnalyzer';

export class GetDefaultKeywords extends DbScript<string[]> {
    public async runInternal(): Promise<Reliable<string[]>> {
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
    constructor(name: string, sessionCode: string, private keywords: string[] | null = null) {
        super(name, sessionCode);
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
    constructor(sessionCode: string, keywords: string[] | null = null) {
        super("find-keywords-in-field-keywords", sessionCode, keywords);
    }
    async createCursorWithProvidedKeywords(keywords: string[]): Promise<Reliable<Readable>> {
        const cursor = AliDbClient.getInstance().useALIDB().collection("news-2").find(keywords.length == 0 ? {} : { keywords: { $in: keywords } });
        return (cursor) ? Reliable.Success(cursor) : Reliable.Failed("Could not create query cursor");
    }

    async updateNewAnalyzeFieldScore(old: AnalyzerDocumentData, document: any): Promise<number> {
        return 1;
    }
}

export class FindKeywords_In_Title_Analyzer extends KeywordsAnalyzer {
    constructor(sessionCode: string, keywords: string[] | null = null) {
        super("find-keywords-in-field-title", sessionCode, keywords);
    }
    async createCursorWithProvidedKeywords(keywords: string[]): Promise<Reliable<Readable>> {

        const regexString = KeywordsUtil.buildRegexString(keywords);
        const cursor = AliDbClient.getInstance().useALIDB().collection("news-2").find({ title: { $regex: regexString } })
        return (cursor) ? Reliable.Success(cursor) : Reliable.Failed("Could not create query cursor");
    }

    async updateNewAnalyzeFieldScore(old: AnalyzerDocumentData, document: any): Promise<number> {
        return 0.7;
    }
}

export class FindKeywords_In_Summary_Analyzer extends KeywordsAnalyzer {
    constructor(sessionCode: string, keywords: string[] | null = null) {
        super("find-keywords-in-field-summary", sessionCode, keywords);
    }
    async createCursorWithProvidedKeywords(keywords: string[]): Promise<Reliable<Readable>> {

        const regexString = KeywordsUtil.buildRegexString(keywords);
        const cursor = AliDbClient.getInstance().useALIDB().collection("news-2").find({ summary: { $regex: regexString } })
        return (cursor) ? Reliable.Success(cursor) : Reliable.Failed("Could not create query cursor");
    }

    async updateNewAnalyzeFieldScore(old: AnalyzerDocumentData, document: any): Promise<number> {
        return 0.6;
    }

}

export class FindKeywords_In_RawContent_Analyzer extends KeywordsAnalyzer {
    constructor(sessionCode: string, keywords: string[] | null = null) {
        super("find-keywords-in-field-rawContent", sessionCode, keywords);
    }
    async createCursorWithProvidedKeywords(keywords: string[]): Promise<Reliable<Readable>> {

        const regexString = KeywordsUtil.buildRegexString(keywords);
        const cursor = AliDbClient.getInstance().useALIDB().collection("news-2").find({ rawContent: { $regex: regexString } })
        return (cursor) ? Reliable.Success(cursor) : Reliable.Failed("Could not create query cursor");
    }

    async updateNewAnalyzeFieldScore(old: AnalyzerDocumentData, document: any): Promise<number> {
        return 0.3;
    }

}