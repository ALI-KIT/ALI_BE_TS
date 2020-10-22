import { Reliable } from '@core/repository/base/Reliable';
import MongoClient from 'mongodb';

export abstract class DbScript {
    public abstract run(): Promise<Reliable<any>>;
    protected async mongoClientDisconnect(mongoClient?: MongoClient.MongoClient) {
        if (mongoClient)
            return await mongoClient?.close(true);
    }

    protected async mongoClientConnect(url: string): Promise<MongoClient.MongoClient> {
        return await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    }

}