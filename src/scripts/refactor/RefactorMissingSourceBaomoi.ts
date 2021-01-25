import { Reliable, Type } from "@core/repository/base/Reliable";
import { BaoMoiXemTinCrawler } from "@crawler/impl/BaoMoiXemTinCrawler";
import { MongoDbCrawlerClient } from "@daos/MongoDbCrawlerClient";
import { Domain } from "@entities/Domain";
import { DbScript } from "@scripts/DbScript";
import LoggingUtil from "@utils/LogUtil";

export class RefactorMissingSourceBaomoi extends DbScript<any> {
    protected async runInternal(): Promise<Reliable<any>> {
        const collection = MongoDbCrawlerClient.getInstance().useALIDB().collection("news-2");
        const cursor = (collection.find({ "aggregator.name": "baomoi", "source.url": { $not: /http/ } }));
        for await (const doc of cursor) {
            const refactor = await this.refactor(doc);
            if (refactor.type == Type.FAILED) {
                LoggingUtil.consoleLog("Doc [" + doc.title + "] refactored failed with message = [" + refactor.message + "], error = [" + refactor.error + "]. ")
                return refactor;
            }

            if (await collection.findOne({ "source.url": doc.source.url })) {
                // co url tuong tu trong db
                // xoa tin nay
                await collection.deleteOne({ "_id": doc._id });
                LoggingUtil.consoleLog("Deleted " + doc._id);
            } else {
                // update
                await collection.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
                LoggingUtil.consoleLog("Updated " + doc._id);
            }
        }
    }

    private async refactor(doc: any): Promise<Reliable<any>> {
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

}

DbScript.exec(new RefactorMissingSourceBaomoi());