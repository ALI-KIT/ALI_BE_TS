import { Reliable, Type } from '@core/repository/base/Reliable';
import { MongoDbConnector } from '@mongodb';
import LoggingUtil from '@utils/LogUtil';
import MongoClient from 'mongodb';

export abstract class DbScript<T> {
    // timeOut = 90 minutes
    public timeOut = 90 * 60 * 1000;
    public async run(): Promise<Reliable<T>> {
        const scriptName = this.constructor.name;
        if (this.timeOut > 0) {
            setTimeout(function () {
                const message = "Script \"" + scriptName + "\" reached timeout (" + this.timeOut + "ms ).";
                throw message;
            }, this.timeOut);
        }
        try {
            const prepared = await this.prepare();
            if (prepared.type == Type.FAILED) {
                return Reliable.Failed(prepared.message, prepared.error);
            }
            return await this.runInternal();
        } catch (e) {
            return Reliable.Failed("Error when preparing or running script", e);
        }
    }

    protected async prepare(): Promise<Reliable<string>> {
        return await MongoDbConnector.connect();
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