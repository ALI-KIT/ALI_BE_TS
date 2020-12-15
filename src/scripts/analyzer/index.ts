import { Reliable, Type } from '@core/repository/base/Reliable';
import CrawlerScript from '@crawler/CrawlerScript';
import { DbScript } from '@scripts/DbScript';
import LoggingUtil from '@utils/LogUtil';
import { FetchNewsFeedAnalyzer } from './FetchNewsFeedAnalyzer';
import { GroupingBySimilarity } from './GroupBySimilarity';

const RUN_AT_START_UP = true;

export class AppAnalyzer extends DbScript<any> {
    constructor() {
        super();
        this.timeOut = 2 * 45 * 60 * 60 * 1000; // timeout 90'
    }
    protected async runInternal(): Promise<Reliable<any>> {
        const tasks: DbScript<any>[] = [
            new CrawlerScript(),
            new FetchNewsFeedAnalyzer(),
            new GroupingBySimilarity(),
        ];

        const resultArray = [];
        for (let task of tasks) {
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
