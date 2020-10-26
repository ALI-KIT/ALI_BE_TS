import MongoClient from 'mongodb';
import { type } from 'os';

class MongoDblogging {
    public client?: MongoClient.MongoClient;
    constructor(public connectionString: string) {
        this.connect().then((client) => {
            this.client = client;
        });
    }

    public async connect(): Promise<MongoClient.MongoClient> {
        return await MongoClient.connect(this.connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    public async close(): Promise<void> {
        return await this.client?.close();
    }
}

class AppDbLogging extends MongoDblogging {
    private static readonly CRON_TAB_STATE = "cron-tab-state";
    constructor() {
        super("mongodb+srv://user1:123455@ali-db.gyx2c.gcp.mongodb.net/");
    }

    public newObjectId() {
        return new MongoClient.ObjectId();
    }

    public async writeCronLog(document: any) {
        if (!this.client) {
            this.client = await this.connect();
        }

        const value = await this.writeLog(document, "cron-tab-state");

        const db = this.client.db("SERVER-CONFIG");
        const cronTabState = (await db.collection("server-state").findOne({ name: "cron-tab-state" }));
        cronTabState.state = value.state || "not-running";
        cronTabState.updatedAt = new Date(Date.now());
        cronTabState.latest = document;
        await db.collection("server-state").updateOne({ _id: cronTabState._id }, { $set: cronTabState }, { upsert: true });

        return value;
    }

    public async writeLog(document: any, type: string = "no-type") {
        if (!this.client) {
            this.client = await this.connect();
        }

        const db = this.client.db("SERVER-CONFIG");
        const collection = db.collection("server-logging");

        if (!document.type) {
            document.type = type;
        }

        if (!document._id) {
            document._id = this.newObjectId();
        }

        await collection.updateOne({ _id: document._id }, { $set: document }, { upsert: true })
        return document;
    }
}

const Logger = new AppDbLogging();

export { MongoDblogging, AppDbLogging, Logger };