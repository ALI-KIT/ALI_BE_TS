import { Reliable, Type } from '@core/repository/base/Reliable';
import { MongoDbConnector, State } from '@mongodb';
import CrawlerScript from '@crawler/CrawlerScript';
import { DbScript } from '@scripts/DbScript';
import LoggingUtil from '@utils/LogUtil';
import { BackendToBackendFetchNewsFeedsAnalyzer } from './BackendToBackendFetchNewsFeedsAnalyzer';
import { GroupingBySimilarity } from './GroupBySimilarity';
import { LimitBackendDocument, LimitCrawlerDocument } from './LimitDocument';
import { BeAnalyticsTrigger } from './BeAnalyticsTrigger';
import { CrawlerToBackend_FetchNewsFeed_Analyzer } from './CrawlerToBackend_FetchNewsFeeds_Analyzer';

const RUN_AT_START_UP = false;

export class AppAnalyzer extends DbScript<any> {
    public tasks: DbScript<any>[] = [];
    public runAnalyticsTask = true;
    public runCrawlerTasks = true;
    protected async prepare(): Promise<Reliable<string>> {
        const s = await super.prepare();

        if (s.type == Type.FAILED) {
            return s;
        }

        if (this.runCrawlerTasks && MongoDbConnector.INSTANCE.states[0] == State.ON && MongoDbConnector.INSTANCE.states[2] == State.ON) {
            // crawl news into database
            this.tasks.push(new CrawlerScript());
            // remove old documents if it exceeds 47k documents
            this.tasks.push(new LimitCrawlerDocument());
            // trigger sub-domain analytic servers
            this.tasks.push(new BeAnalyticsTrigger());
        }

        if (this.runAnalyticsTask && MongoDbConnector.INSTANCE.states[1] == State.ON && MongoDbConnector.INSTANCE.states[3] == State.ON) {
            // fetch local news from crawler database into backend database
            this.tasks.push(new CrawlerToBackend_FetchNewsFeed_Analyzer());

            // fetch local news from backend database with some admin's custom configurations
            this.tasks.push(new BackendToBackendFetchNewsFeedsAnalyzer());

            // fetch headlines news
            this.tasks.push(new GroupingBySimilarity());

            // remove old documents (backend database) if it exceeds 40k documents
            this.tasks.push(new LimitBackendDocument());
        }
        return s;
    }

    constructor() {
        super();
        this.timeOut = 2 * 45 * 60 * 60 * 1000; // timeout 90'
    }
    protected async runInternal(): Promise<Reliable<any>> {
        const tasks = this.tasks;

        const resultArray = [];
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            LoggingUtil.consoleLog("\n\n------- Running task \"" + task.constructor?.name + "\" --------\n");
            const result = await task.run();
            if (result.type == Type.FAILED) {
                return result;
            } else {
                resultArray.push(result.data);
            }
        }

        return Reliable.Success(resultArray);

    }
}

if (RUN_AT_START_UP) {
    new AppAnalyzer().run().then((reliable) => {
        LoggingUtil.consoleLog("Task finished with below data: ");
        LoggingUtil.consoleLog(reliable)
    }).catch(e => {
        LoggingUtil.consoleLog(e);
    }).finally(() => {
        process.exit(0);

    })
}
