import { Reliable } from '@core/repository/base/Reliable';
import { AliDbClient } from '@dbs/AliDbClient';
import MongoClient from 'mongodb';

export abstract class DbScript<T> {
    public async run(): Promise<Reliable<T>> {
        try {
            await this.prepare();
            return await this.runInternal();
        } catch (e) {
            return Reliable.Failed("Error when executing script", e);
        }
    }

    protected async prepare(): Promise<Reliable<string>> {
        await AliDbClient.connect();
        return Reliable.Success("");
    }

    protected abstract runInternal(): Promise<Reliable<T>>;
    protected async mongoClientDisconnect(mongoClient?: MongoClient.MongoClient) {
        if (mongoClient)
            return await mongoClient?.close(true);
    }

    protected async mongoClientConnect(url: string): Promise<MongoClient.MongoClient> {
        return await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    public static exec(script: DbScript<any>) {
        script.run().then((reliable) => {
            console.log("Task finished with below data: ");
            console.log(reliable)
        }).catch(e => {
            console.log(e);
        }).finally(() => {
            process.exit(0);
        })

    }

}