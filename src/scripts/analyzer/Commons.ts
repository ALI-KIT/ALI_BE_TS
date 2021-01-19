import { Reliable, Type } from '@core/repository/base/Reliable';
import { GetKeywordsData } from '@core/usecase/common/GetKeywordsData';
import { AliDbClient } from '@dbs/AliDbClient';
import { DbScript } from '@scripts/DbScript';
import { KeywordsUtil } from '@utils/KeywordsUtil';
import { Readable } from 'stream';
import { AnalyzerDocumentData, FeedAnalyzer } from './FeedAnalyzer';

export class GetDefaultKeywords extends DbScript<string[]> {
    public async runInternal(): Promise<Reliable<string[]>> {
        return new GetKeywordsData().invoke([]);
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

    abstract createCursorWithProvidedKeywords(keywords: string[]): Promise<Reliable<Readable>>;

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
        return 1;
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
        return 0.9;
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
        return 0.7;
    }

}