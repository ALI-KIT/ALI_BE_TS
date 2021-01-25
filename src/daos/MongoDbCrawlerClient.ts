import { Reliable } from '@core/repository/base/Reliable';
import { AppProcessEnvironment } from '@loadenv';
import MongoClient from 'mongodb';

/**
 * Client for the Crawler MongoDb URI
 */
export class MongoDbCrawlerClient {

    //TODO: Thêm các biến db collection 
    public crawlerDbClient?: MongoClient.MongoClient;
    public configDbClient?: MongoClient.MongoClient;

    private async initInternal(): Promise<Reliable<any>> {
        //TODO: Init các collection
        try {
            if (!this.crawlerDbClient) {
                this.crawlerDbClient = await this.mongoClientConnect(AppProcessEnvironment.NEWS_CRAWLER_URI);
            }

            if (!this.configDbClient) {
                this.configDbClient = await this.mongoClientConnect(AppProcessEnvironment.CONFIG_DB_URI);
            }
            return Reliable.Success(null);
        } catch (e) {
            return Reliable.Failed("Failed to init MongoDbCrawlerClient", e);
        }
    }

    public useALIDB(client: MongoClient.MongoClient = this.crawlerDbClient!): MongoClient.Db {
        return client.db("ALI-DB");
    }

    public useServerConfig(client: MongoClient.MongoClient = this.configDbClient!): MongoClient.Db {
        return client.db("SERVER-CONFIG");
    }

    private async disconnect(): Promise<Reliable<any>> {
        await this.mongoClientDisconnect(this.crawlerDbClient);
        await this.mongoClientDisconnect(this.configDbClient);
        return Reliable.Success(null);
    }

    private async mongoClientDisconnect(mongoClient?: MongoClient.MongoClient) {
        if (mongoClient)
            return await mongoClient?.close(true);
    }

    private async mongoClientConnect(url: string): Promise<MongoClient.MongoClient> {
        return await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    private static instance = new MongoDbCrawlerClient();

    private constructor() { }

    public static getInstance(): MongoDbCrawlerClient {
        return MongoDbCrawlerClient.instance;
    }

    public static async init(): Promise<Reliable<any>> {
        return await MongoDbCrawlerClient.instance.initInternal();
    }
    public static async disconnect(): Promise<Reliable<any>> {
        return await MongoDbCrawlerClient.instance.disconnect();
    }
}
