import LoggingUtil from '@utils/LogUtil';
import MongoClient from 'mongodb';

class ExportAtlasToLocal {
    private fromConnectionString = "mongodb+srv://user1:123455@ali-db.gyx2c.gcp.mongodb.net/";
    private toConnectionString = "mongodb://127.0.0.1/27017/ALI-DB";

    private dbList = ["ALI-DB","locals"];

    public async run(): Promise<void> {
        const fromDbClient = await this.mongoClientConnect(this.fromConnectionString);
        const toDbClient = await this.mongoClientConnect(this.toConnectionString);
    
        for(var i = 0;i<this.dbList.length; i++) {
                const dbString = this.dbList[i];
                await this.copyDb(fromDbClient, toDbClient, dbString,dbString);
        }

        await fromDbClient.close();
        await toDbClient.close();
    }

    public async copyDb(fromDbClient: MongoClient.MongoClient, 
        toDbClient: MongoClient.MongoClient,
         fromDbString: string, 
         toDbString: string): Promise<void> {
         const fromDb = fromDbClient.db(fromDbString);
         const toDb = toDbClient.db(toDbString);
         
         const fromCollectionList = await fromDb.listCollections().toArray();
         const toCollectionList = await fromDb.listCollections().toArray();

         LoggingUtil.consoleLog("\n--- Collections in FromDb "+fromDbString+" ---");
         fromCollectionList.forEach(collection => {
             LoggingUtil.consoleLog(collection);
         })

         LoggingUtil.consoleLog("\n--- Collections in ToDb "+ toDbString+" ---");
         toCollectionList.forEach(collection => {
            LoggingUtil.consoleLog(collection);
        })
    }

     private async mongoClientDisconnect(mongoClient?: MongoClient.MongoClient) {
        if(mongoClient)
        return await mongoClient?.close(true);
    }

    private async mongoClientConnect(url: string): Promise<MongoClient.MongoClient> {
        return await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    }
}

new ExportAtlasToLocal().run().then(() => {
    LoggingUtil.consoleLog("Task Finished.");
    process.exit(0);
}).catch((e) => {
    LoggingUtil.consoleLog("Task finished with exception: "+e);
    throw e;
});