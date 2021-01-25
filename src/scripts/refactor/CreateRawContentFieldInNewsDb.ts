import { Reliable, Type } from '@core/repository/base/Reliable';
import { AppProcessEnvironment } from '@loadenv';
import CrawlUtil from '@utils/CrawlUtils';
import LoggingUtil from '@utils/LogUtil';
import MongoClient from 'mongodb';
import textversionjs from 'textversionjs';

export class CreateRawContentFieldInNewsDb {
    private connectionString = AppProcessEnvironment.NEWS_CRAWLER_URI;
    private dbString = "ALI-DB";
    private collectionString = "news-2";
    public async run(): Promise<Reliable<any>> {
        const client = await this.mongoClientConnect(this.connectionString);
        const serverConfigDb = client.db(this.dbString);
        const collection = serverConfigDb.collection(this.collectionString);

        let bulkWrites = [];
        const bulkDocumentsSize = 300;
        let i = 0;
        const count = await collection.countDocuments();
        const cursor = collection.find({});
        for await (const doc of cursor) {
            i++;
            if (doc.content) {
                doc.rawContent = CrawlUtil.getRawTextContent(doc.content);
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
        bulkWrites = [];
        LoggingUtil.consoleLog("Updated " + i + " / " + count + " documents")

        return Reliable.Success("Flush " + i + " of " + count + " documents in " + this.dbString + "[" + this.collectionString + "].");
    }

    private getRawContentv2(content: string) {
        const span = document.createElement('span');
        span.innerHTML = content;
        return span.textContent || span.innerText || "";
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
