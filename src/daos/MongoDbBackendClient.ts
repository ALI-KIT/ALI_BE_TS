import { Reliable } from '@core/repository/base/Reliable';
import { AppProcessEnvironment } from '@loadenv';
import MongoClient from 'mongodb';

/**
 * Client for the Back-end MongoDb URI
 */
export class MongoDbBackendClient {

    public beAnalyticClient?: MongoClient.MongoClient;

    private async initInternal(): Promise<Reliable<any>> {
        try {
            if (!this.beAnalyticClient) {
                this.beAnalyticClient = await this.mongoClientConnect(AppProcessEnvironment.URI_BACK_END);
            }
            return Reliable.Success(null);
        } catch (e) {
            return Reliable.Failed("Failed to init MongoDbBackendClient!", e);
        }
    }

    public useALIDB(client: MongoClient.MongoClient = this.beAnalyticClient!): MongoClient.Db {
        return client.db("ALI-DB");
    }

    public useServerConfig(client: MongoClient.MongoClient = this.beAnalyticClient!): MongoClient.Db {
        return client.db("SERVER-CONFIG");
    }

    private static instance = new MongoDbBackendClient();

    private constructor() { }
    public static getInstance(): MongoDbBackendClient {
        return MongoDbBackendClient.instance;
    }

    public static async init(): Promise<Reliable<any>> {
        return await MongoDbBackendClient.getInstance().initInternal();
    }

    private async mongoClientDisconnect(mongoClient?: MongoClient.MongoClient) {
        if (mongoClient)
            return await mongoClient?.close(true);
    }

    private async mongoClientConnect(url: string): Promise<MongoClient.MongoClient> {
        return await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    }
}