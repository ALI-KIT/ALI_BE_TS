import { AppProcessEnvironment } from '@loadenv';
import MongoClient from 'mongodb';

/**
 * Giữ kết nối tới mọi Collection nằm trong một MongoDb Dbs Connection
 */
export class AliDbClient {

    //TODO: Thêm các biến db collection 
    public defaultNewsClient?: MongoClient.MongoClient;
    public defaultConfigClient?: MongoClient.MongoClient;

    private async connect(): Promise<void> {
        //TODO: Init các collection
        if (!this.defaultNewsClient) {
            this.defaultNewsClient = await this.mongoClientConnect(AppProcessEnvironment.NEWS_DB_URI);
        }

        if (!this.defaultConfigClient) {
            this.defaultConfigClient = await this.mongoClientConnect(AppProcessEnvironment.CONFIG_DB_URI);
        }
    }

    public useALIDB(client: MongoClient.MongoClient = this.defaultNewsClient!): MongoClient.Db {
        return client.db("ALI-DB");
    }

    public useServerConfig(client: MongoClient.MongoClient = this.defaultConfigClient!): MongoClient.Db {
        return client.db("SERVER-CONFIG");
    }

    private async disconnect(): Promise<void> {
        await this.mongoClientDisconnect(this.defaultNewsClient);
        await this.mongoClientDisconnect(this.defaultConfigClient);
    }

    private async mongoClientDisconnect(mongoClient?: MongoClient.MongoClient) {
        if (mongoClient)
            return await mongoClient?.close(true);
    }

    private async mongoClientConnect(url: string): Promise<MongoClient.MongoClient> {
        return await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    private static instance = new AliDbClient();

    private AliDbClient() { }

    public static getInstance(): AliDbClient {
        if (!AliDbClient.instance.isConnected) {
            throw "AliDbClient is n't connected yet!"
        }
        return AliDbClient.instance;
    }

    private isConnected: boolean = false;
    public static async connect(): Promise<void> {
        if (!AliDbClient.instance.isConnected) {
            await AliDbClient.instance.connect();
            AliDbClient.instance.isConnected = true;
        }
    }

    public static async disconnect(): Promise<void> {
        if (AliDbClient.instance.isConnected) {
            return await AliDbClient.instance.disconnect();
        }
    }

}