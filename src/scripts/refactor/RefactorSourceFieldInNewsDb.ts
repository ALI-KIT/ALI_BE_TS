import { Reliable, Type } from '@core/repository/base/Reliable';
import { BaoMoiXemTinCrawler } from '@crawler/impl/BaoMoiXemTinCrawler';
import { Domain } from '@entities/Domain';
import { AppProcessEnvironment } from '@loadenv';
import CrawlUtil from '@utils/CrawlUtils';
import LoggingUtil from '@utils/LogUtil';
import MongoClient from 'mongodb';

export class CreateRawContentFieldInNewsDb {
    private connectionString = AppProcessEnvironment.NEWS_DB_URI;
    private dbString = "ALI-DB";
    private collectionString = "news-2";
    public async run(): Promise<Reliable<any>> {
        const client = await this.mongoClientConnect(this.connectionString);
        const db = client.db(this.dbString);
        const collection = db.collection(this.collectionString);

        let bulkWrites = [];
        const bulkDocumentsSize = 300;
        let i = 0;
        const count = await collection.countDocuments();

        const cursor = (collection.find({}))
        for await (const doc of cursor) {
            i++;
            const refactor = await this.refactor(doc);
            if (refactor.type == Type.FAILED) {
                LoggingUtil.consoleLog("Doc [" + doc.title + "] refactored failed with message = [" + refactor.message + "], error = [" + refactor.error + "]. ")
            }

            bulkWrites.push({
                replaceOne: {
                    filter: { _id: doc._id },
                    replacement: doc,
                },
            })

            if (i % bulkDocumentsSize === 0) {
                await collection.bulkWrite(bulkWrites);
                bulkWrites = [];
                LoggingUtil.consoleLog("Updated " + i + " / " + count + " documents")
            }
        }

        await collection.bulkWrite(bulkWrites);
        LoggingUtil.consoleLog("Updated " + i + " / " + count + " documents");

        /* await collection.find({}).forEach(doc => {
            this.refactor(doc);

            bulkWrites.push({
                replaceOne: {
                    filter: { _id: doc._id },
                    replacement: doc,
                },
            })

            if ((i + 1) % bulkDocumentsSize === 0 || i == count - 1) {
                collection.bulkWrite(bulkWrites);
                bulkWrites = [];
                LogUtil.consoleLog("Updated " + i + " / " + count + " documents")
            }

            i++;
        }) */
        return Reliable.Success("Flush " + i + " of " + count + " documents in " + this.dbString + "[" + this.collectionString + "].");
    }

    private async refactor(doc: any): Promise<Reliable<any>> {
        return await this.refactor1(doc);
    }

    private async refactor2(doc: any): Promise<Reliable<any>> {
        const source: Domain = doc.source;
        const aggregator: Domain = doc.aggregator;
        if (aggregator.name == "baomoi") {
            const baoMoiUrl = aggregator.url;
            const parsed = await new BaoMoiXemTinCrawler(baoMoiUrl).execute();
            if (parsed && parsed.data) {
                source.baseUrl = parsed.data.source.baseUrl;
                source.displayName = parsed.data.source.displayName;
                source.name = parsed.data.source.name;
                source.url = parsed.data.source.url;
            }

        }
        return Reliable.Success("");
    }

    private async refactor1(doc: any): Promise<Reliable<any>> {
        const source = doc.source;
        if (source) {
            const url = source.url;

            if (url) {
                const prettyUrl = CrawlUtil.prettyUrl(url);
                const baseUrl = CrawlUtil.baseUrl(url);
                source.name = prettyUrl.data || "";
                source.baseUrl = baseUrl.data || "";

                let message: string = "";
                let error: Error | null = null;
                if (prettyUrl.type == Type.FAILED) {
                    message += prettyUrl.message + ". ";
                    error = prettyUrl.error;
                } else if (prettyUrl.data == "") {
                    message += "Get pretty url successfully but empty result. ";
                }

                if (baseUrl.type == Type.FAILED) {
                    message += baseUrl.message + ". ";
                    error = baseUrl.error;
                } else if (baseUrl.data == "") {
                    message = "Get base url successfully but empty result. ";
                }

                if (message !== "") return Reliable.Failed(message, error || undefined);
                return Reliable.Success(null);

            } else return Reliable.Failed("The url is missing");
        }
        return Reliable.Success("");
    }

    private async mongoClientDisconnect(mongoClient?: MongoClient.MongoClient) {
        if (mongoClient)
            return await mongoClient?.close(true);
    }

    private async mongoClientConnect(url: string): Promise<MongoClient.MongoClient> {
        return await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    }
}

new CreateRawContentFieldInNewsDb().run().then((reliable) => {
    LoggingUtil.consoleLog("Task finished with below data: ");
    LoggingUtil.consoleLog(reliable)
}).catch(e => {
    LoggingUtil.consoleLog(e);
}).finally(() => {
    process.exit(0);

})
