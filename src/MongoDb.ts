// Nhập mô-đun mongoose
// Chỉ import 1 LẦN và DUY NHẤT trong file Server.ts
import { MongoDbCrawlerClient } from '@daos/MongoDbCrawlerClient';
import CrawlerDatabase from '@daos/CrawlerDatabase';
import { Reliable, Type } from '@core/repository/base/Reliable';
import LoggingUtil from '@utils/LogUtil';
import AppDatabase from '@daos/AppDatabase';
import { MongoDbBackendClient } from '@daos/MongoDbBackendClient';
import { AppProcessEnvironment } from '@loadenv';

export enum State {
    NOT_YET_INITIALIZED,
    ON,
    OFF,
    CRASHED
};

export class MongoDbConnector {
    public names = [
        "Mongoose [AppDatabase-BE-Analytics]",
        "Mongoose [CrawlerDatabase]",
        "MongoDb [Backend-Analytics]",
        "MongoDb [Crawler]"
    ];
    public states: State[] = [
        State.NOT_YET_INITIALIZED,
        State.NOT_YET_INITIALIZED,
        State.NOT_YET_INITIALIZED,
        State.NOT_YET_INITIALIZED
    ];

    public logStates() {
        LoggingUtil.consoleLog("\n\n-------- MongoDb State --------");
        this.states.forEach((element, index) => {
            LoggingUtil.consoleLog(this.names[index] + " : " + State[element]);
        });
        LoggingUtil.consoleLog("-------- End MongoDb State --------");
    }

    public logReliable(name: string, reliable: Reliable<any>) {
        if (reliable.type == Type.FAILED) {
            LoggingUtil.consoleLog(name + " failed to connect!");
            LoggingUtil.consoleLog(reliable);
            LoggingUtil.consoleLog("App will be terniminated soon!");
        } else {
            LoggingUtil.consoleLog(name + " is connected");
        }
    }

    public static INSTANCE = new MongoDbConnector();
    public static async connect(): Promise<Reliable<any>> {
        return await MongoDbConnector.INSTANCE.connect();
    }

    private constructor() { }
    public async connect(): Promise<Reliable<any>> {
        const beUri = AppProcessEnvironment.BACKEND_URI;
        const crawlerUri = AppProcessEnvironment.NEWS_CRAWLER_URI;
        const configUri = AppProcessEnvironment.CONFIG_DB_URI;
        let changed = false;
        // init app database
        if (beUri && beUri != "") {
            if (this.states[0] != State.ON) {
                const reliable = await AppDatabase.init();
                this.logReliable(this.names[0], reliable);

                this.states[0] = (reliable.type == Type.SUCCESS) ? State.ON : State.CRASHED;
                changed = true;
            }
        } else {
            this.states[0] = State.OFF;
        }

        // init crawler database
        if (crawlerUri && crawlerUri != "") {
            if (this.states[1] != State.ON) {
                const reliable = await CrawlerDatabase.init();
                this.logReliable(this.names[1], reliable);

                this.states[1] = (reliable.type == Type.SUCCESS) ? State.ON : State.CRASHED;
                changed = true;
            }
        } else {
            this.states[1] = State.OFF;
        }

        // init mongodb backend database
        if (beUri && beUri != "" && configUri && configUri != "") {
            if (this.states[2] != State.ON) {
                const reliable = await MongoDbBackendClient.init();
                this.logReliable(this.names[2], reliable);

                this.states[2] = (reliable.type == Type.SUCCESS) ? State.ON : State.CRASHED;
                changed = true;
            }
        } else {
            this.states[2] = State.CRASHED;
        }

        // init mongodb crawler database
        if (crawlerUri && crawlerUri != "") {
            if (this.states[3] != State.ON) {
                const reliable = await MongoDbCrawlerClient.init();
                this.logReliable(this.names[3], reliable);

                this.states[3] = (reliable.type == Type.SUCCESS) ? State.ON : State.CRASHED;
                changed = true;
            }
        } else {
            this.states[3] = State.OFF;
        }

        if (changed) {
            this.logStates();
        }
        let success = true;
        for (let i = 0; i < this.states.length; i++) {
            if (this.states[i] == State.CRASHED) {
                success = false;
                break;
            }
        }
        if (success) {
            return Reliable.Success(null);
        } else {
            return Reliable.Failed(this.states.toString());
        }
    }
}