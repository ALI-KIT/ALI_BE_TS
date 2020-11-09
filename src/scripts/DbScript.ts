import { Reliable } from '@core/repository/base/Reliable';
import { AliDbClient } from '@dbs/AliDbClient';
import LoggingUtil from '@utils/LogUtil';
import { TimeoutError } from 'bluebird';
import MongoClient from 'mongodb';

export abstract class DbScript<T> {
    // timeOut = 45 minutes
    public timeOut = 45 * 60 * 1000;
    public async run(): Promise<Reliable<T>> {
        const timeOut = this.timeOut;
        setTimeout(function () {
            throw new TimeoutError("Script ran timeout (" + timeOut + "ms ).");
        }, this.timeOut);
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
            LoggingUtil.consoleLog("Task finished with below data: ");
            LoggingUtil.consoleLog(reliable)
        }).catch(e => {
            LoggingUtil.consoleLog(e);
        }).finally(() => {
            process.exit(0);
        })

    }

}