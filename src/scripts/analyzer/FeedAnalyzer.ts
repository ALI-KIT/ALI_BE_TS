import MongoClient from 'mongodb';
import { Readable } from 'stream';
import { DbScript } from '@scripts/DbScript';
import { Reliable, Type } from '@core/repository/base/Reliable';
import LoggingUtil from '@utils/LogUtil';

/**
 * Thông tin analyze của field trong documentdocument (keywords, title, ...)
 */
export class AnalyzerFieldData {
    constructor(public readonly name: string, public readonly score: number) { }
}

/**
 * Thông tin analyze của documentdocument
 */
export class AnalyzerDocumentData {
    public static readonly _1_HOUR = 60 * 60 * 3600;
    public static readonly _6_HOURS = 6 * AnalyzerDocumentData._1_HOUR;
    public static readonly _24_HOUR = 24 * AnalyzerDocumentData._1_HOUR;
    public static readonly _3_DAYS = 3 * AnalyzerDocumentData._24_HOUR;
    public static readonly _7_DAYS = 7 * AnalyzerDocumentData._24_HOUR;
    public static readonly _1_MONTH = 30 * AnalyzerDocumentData._24_HOUR;
    public static readonly _12_MONTH = 12 * AnalyzerDocumentData._1_MONTH;

    constructor(public readonly targetId: MongoClient.ObjectId) { }
    private score: number = 0;
    public trendingScore = 1;

    public getScore(): number { return this.score; }
    public readonly data: AnalyzerFieldData[] = [];

    public updateAnalyzeFieldData(fieldData: AnalyzerFieldData) {
        let index = this.data.findIndex(item => item.name == fieldData.name)
        if (index == -1) {
            this.data.push(fieldData);
        } else {
            this.data[index] = fieldData;
        }

        let newScore = 0;
        // cong tong
        //this.data.forEach(item => newScore += item.score);

        // lay diem cao nhat
        this.data.forEach(item => {
            if (item.score > newScore) {
                newScore = item.score;
            }
        })
        this.score = newScore;

    }

    public getAnalyzeFieldData(name: string): AnalyzerFieldData {
        let object: AnalyzerFieldData
        let index = this.data.findIndex(item => item.name == name)

        if (index == -1) {
            object = new AnalyzerFieldData(name, 0);
            this.data.push(object);
        } else {
            object = this.data[index];
        }
        return object;
    }

    /**
     * Convert any to type object
     * @param raw 
     */
    public static refine(targetId: MongoClient.ObjectId, raw: any): AnalyzerDocumentData {
        const result = new AnalyzerDocumentData(targetId);

        /* only refine if matched target id */
        if (raw && targetId.equals(raw.targetId) && Array.isArray(raw.data)) {
            const rawData: Array<any> = Array.from(raw.data) || [];
            rawData.forEach(item => {
                if (item.name && typeof (item.name) === 'string') {
                    const score = (item.score) ? Number(item.score) : 0
                    result.updateAnalyzeFieldData(new AnalyzerFieldData(item.name, score))
                }
            });
        }
        return result;
    }
}

/**
 * filter news-2 và up-sert kết quả vào db
 * Template Method Pattern:
 * Bước 1: Lấy cursor của filter 
 * Bước 2: Vòng for loop toàn bộ database theo cursor, chạy một hàm cho ra kết quả
 * Bước 3: Từ kết quả đó, hãy update item đó trong server-state-analyzer
 * Bước 4: Up-sert kết quả vào db (giống nhau trên mọi analyzer)
 */
export abstract class FeedAnalyzer extends DbScript<any> {
    public abstract readonly name: string;
    constructor(public newsCollection: MongoClient.Collection<any>, public analyzerCollection: MongoClient.Collection<any>, public readonly sessionCode: string) { super() }

    /**
     * Return the score 
     */
    async runInternal(): Promise<Reliable<any>> {

        /* step 1: get the cursor */
        const cursorReliable = await this.createCursor();
        if (cursorReliable.type == Type.FAILED) {
            return Reliable.Failed(cursorReliable.message, cursorReliable.error || undefined);
        } else if (!cursorReliable.data) {
            return Reliable.Failed("Cursor is null");
        }

        /* step 2: loop on every documents */
        const cursor = cursorReliable.data;
        const analyzerCollection = this.analyzerCollection;
        let bulkWrites = [];
        const bulkDocumentsSize = 300;
        let i = 0;
        for await (const document of cursor) {
            i++;
            const targetId: MongoClient.ObjectId = document._id;
            if (!targetId) {
                continue;
            }

            const old = await this.currentAnalyzerDocumentData(document._id);
            if (old.type == Type.FAILED || !old.data) {
                continue;
            }

            const analyzeReliable = await this.analyzeNewData(old.data, document);
            if (analyzeReliable.type == Type.FAILED || !analyzeReliable.data) {
                continue;
            }

            const data = analyzeReliable.data;//.toNativeObject();

            bulkWrites.push({
                replaceOne: {
                    filter: { targetId: targetId },
                    upsert: true,
                    replacement: data
                }
            });

            if (i % bulkDocumentsSize === 0) {
                await analyzerCollection.bulkWrite(bulkWrites);
                bulkWrites = [];
                LoggingUtil.consoleLog("Upsert " + i + " documents");
            }
        }

        if (bulkWrites.length != 0) {
            await analyzerCollection.bulkWrite(bulkWrites);
        }
        LoggingUtil.consoleLog("Upsert " + i + " documents");
        return Reliable.Success("Upsert " + i + " documents");
    }

    abstract createCursor(): Promise<Reliable<Readable>>/*  {
        //const cursor = AppDatabase.getInstance().news2Dao.model.find({}).cursor()
        const cursor = this.client.db("").collection("").find({})
        return Reliable.Success(cursor)
    } */

    async currentAnalyzerDocumentData(targetId: MongoClient.ObjectId): Promise<Reliable<AnalyzerDocumentData>> {
        const collection = this.analyzerCollection;
        const document = await collection.findOne({ targetId: targetId });
        const result = AnalyzerDocumentData.refine(targetId, document);
        return Reliable.Success(result);
    }

    /**
     * update temp data mới dựa vào analyze data cũ và từ document gốc
     * @param old 
     * @param document 
     */
    async analyzeNewData(old: AnalyzerDocumentData, document: any): Promise<Reliable<any>> {
        const newAFD = new AnalyzerFieldData(this.name, await this.updateNewAnalyzeFieldScore(old, document));
        old.updateAnalyzeFieldData(newAFD);
        old = await this.updateNewAnalyzeDocument(old, document);
        document.data = old.data;

        const result = {
            sessionCode: this.sessionCode,
            targetId: old.targetId,
            score: old.getScore(),
            trendingScore: old.trendingScore,
            data: old.data,
            crawlDate: document.crawlDate,
            publicationDate: document.publicationDate,
            analyzeDate: new Date(Date.now()),
            title: document.title,
            summary: document.summary
        }
        return Reliable.Success(result);
    }

    async updateNewAnalyzeDocument(analyzerDocData: AnalyzerDocumentData, newsDocument: any): Promise<AnalyzerDocumentData> {
        const now = Date.now();
        const publicationDate: Date = newsDocument.publicationDate;
        let trendingScore = 0;
        let factor = 0;
        if (publicationDate) {
            const pubDateMilli = publicationDate.getTime();
            const distance = now - pubDateMilli;
            if (distance <= AnalyzerDocumentData._6_HOURS) {
                factor = 1;
            } else if (distance <= AnalyzerDocumentData._24_HOUR) {
                factor = 0.8;
            } else if (distance <= AnalyzerDocumentData._3_DAYS) {
                factor = 0.7 - 0.1 * (distance / AnalyzerDocumentData._3_DAYS);
            } else if (distance <= AnalyzerDocumentData._7_DAYS) {
                factor = 0.25;
            } else if (distance <= AnalyzerDocumentData._1_MONTH) {
                factor = 0.1;
            } else if (distance <= AnalyzerDocumentData._1_MONTH * 3) {
                factor = 0.1 * 0.5;
            } else if (distance <= AnalyzerDocumentData._1_MONTH * 6) {
                factor = 0.1 * 0.3;
            } else if (distance <= AnalyzerDocumentData._12_MONTH) {
                factor = 0.1 * 0.2;
            } else {
                // sau mỗi năm giảm thêm 0.5
                const year = distance / AnalyzerDocumentData._12_MONTH + 1;
                factor = 0.1 * 0.2 * Math.pow(0.5, year);
            }

        }

        trendingScore = factor * analyzerDocData.getScore();
        analyzerDocData.trendingScore = trendingScore;
        return analyzerDocData;
    }

    async updateNewAnalyzeFieldScore(old: AnalyzerDocumentData, document: any): Promise<number> {
        return 1;
    }

}
