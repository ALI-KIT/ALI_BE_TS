import '@loadenv';
import MongoClient from 'mongodb';

/**
 * Script initing data server config
 */
class CreateServerConfigDb {
    private connectionString = "mongodb+srv://user1:123455@ali-db.gyx2c.gcp.mongodb.net/";
    private dbString = "SERVER-CONFIG";

    public async run() : Promise<void> {
        const client = await this.mongoClientConnect(this.connectionString);
        const db = client.db(this.dbString);
        const stateCollection = await db.createCollection("server-state");

        /* add con-tab-state document */
        await stateCollection.insertOne({
            name: "cron-tab-state",
            state:"not-running"
        });

        await stateCollection.insertOne({
            name:"server-logging-info",
            list:[
                {
                    type: "cron-tab-session",
                    count: 1
                },
                {
                    type: "crawler-manager-session",
                    count: 1
                }
            ]
        })

        const loggingCollection = await db.createCollection("server-logging");
        await loggingCollection.insertOne({
            name:"dump-cron-tab-session",
            type:"cron-tab-session",
            startedAt: Date.now(),
            finishedAt: Date.now(),
            duration: 0,
            state: "finished"            
        });

        await loggingCollection.insertOne({
            name: "dump-crawler-manager-session",
            type: "crawler-manager-session",
            startedAt: Date.now(),
            finishedAt: Date.now(),
            duration: 0,
            state: "finished" 
        });

        await this.mongoClientDisconnect(client);
    }

    private async mongoClientDisconnect(mongoClient?: MongoClient.MongoClient) {
        if(mongoClient)
        return await mongoClient?.close(true);
    }

    private async mongoClientConnect(url: string): Promise<MongoClient.MongoClient> {
        return await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    }
}

new CreateServerConfigDb().run().then(() => {
    console.log("Task Finished.");
    process.exit(0);
}).catch((e) => {
    console.log("Task finished with exception: "+e);
    throw e;
});