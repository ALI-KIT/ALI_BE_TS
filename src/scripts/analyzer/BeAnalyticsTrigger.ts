import { Reliable, Type } from "@core/repository/base/Reliable";
import CrawlerDatabase from "@daos/CrawlerDatabase";
import { DbScript } from "@scripts/DbScript";
import CrawlUtil from "@utils/CrawlUtils";
import LoggingUtil from "@utils/LogUtil";

export class BeAnalyticsTrigger extends DbScript<any> {
    protected async runInternal(): Promise<Reliable<any>> {
        const beServers = await (await CrawlerDatabase.waitInstance()).beAnalyticsServerDao.model.find({}).exec();
        for (let i = 0; i < beServers.length; i++) {
            LoggingUtil.consoleLog("Triggering analytics [" + beServers[i].name + "] at [" + beServers[i].analyticsUrl);
            const analyticsUrl = beServers[i].analyticsUrl;
            // call the analytics url, if it failed, retrying for a number of times
            let retryLeft = 10;
            let reliable: Reliable<any>;
            do {
                reliable = await CrawlUtil.loadWebsiteReliable(analyticsUrl);

                if (retryLeft <= 0) {
                    break;
                }
                retryLeft--;

            } while (reliable.type == Type.FAILED || retryLeft <= 0);

            if (reliable.type == Type.FAILED) {
                LoggingUtil.consoleLog(reliable);
            };
        }
        return Reliable.Success(null);
    }

}