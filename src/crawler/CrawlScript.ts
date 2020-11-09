import '@loadenv';
import '@mongodb';

import { CrawlerManager } from "./base/CrawlerManager";
import { BaoMoiTinMoiCrawler } from './impl/BaoMoiTinMoiCrawler';

import { Logger } from '@utils/AppDbLogging';
import { State } from './base/Crawler';
import { AliAggregatorCrawler } from './impl/AliAggregatorCrawler';
import { Reliable } from '@core/repository/base/Reliable';
import LoggingUtil from '@utils/LogUtil';

class CrawlScript {
    public session: any;
    public manager?: CrawlerManager;
    public isInitted() {
        return this.manager && this.session && this.manager.status != State.PENDING;
    }

    public async waitOnFinish(): Promise<Reliable<any>> {
        // wait the crawler manager to idle (finished)
        await this.manager?.waitToIdle();
        LoggingUtil.allowLogging = false;

        LoggingUtil.consoleLog("manager is on idle");
        const finishedAt = Date.now();
        this.session.state = "finished";
        this.session.finishedAt = new Date(finishedAt);
        this.session.duration = finishedAt - this.session.startedAt;

        LoggingUtil.consoleLog("Crawl process duration: " + (finishedAt - this.session.startedAt));
        LoggingUtil.consoleLog("CrawlingListSize = " + this.manager?.crawlingList.length);
        if (this.manager?.crawlingList.length == 1) {
            LoggingUtil.consoleLog(this.manager?.crawlingList[0]);
        }
        LoggingUtil.consoleLog("CrawlUrlListSize = " + this.manager?.crawlUrlList.length);
        const counter = this.manager?.counter;
        this.session.counter = counter;
        this.session.crawlings = this.manager?.crawlingList?.map(c => { c.name, c.url })
        this.session.crawlingsSize = this.manager?.crawlingList?.length;
        this.session.crawlPoolSize = this.manager?.crawlUrlList.length;
        await Logger.writeCronLog(this.session);
        return Reliable.Success(counter);
    }

    public async run(): Promise<Reliable<any>> {
        const maxTimeout = 1 * 60 * 60 * 1000;
        const waitToKillProcessTimeout = 5 * 60 * 1000;
        const startedAt = Date.now();

        this.session = await Logger.writeCronLog({
            name: "crawl-script",
            startedAt: new Date(startedAt),
            finishedAt: null,
            duration: 0,
            state: "running",
            message: "",
            counter: null,
        });

        this.manager = CrawlerManager.getInstance('app-crawler-manager');
        this.manager.isAllowRecursion = false;

        this.manager.onActive = () => {
            if (!this.isInitted())
                LoggingUtil.consoleLog("manager is on active");
        };

        await this.manager.addNewCrawler(new AliAggregatorCrawler());
        //await this.manager.addNewCrawler(new BaoMoiTinMoiCrawler(1));

        /* Force idling crawler manager or terniminating the process after timeout duration */

        const s = this;
        setTimeout(function () {
            if (!s.isInitted()) return;
            /* try to stop the manager */
            LoggingUtil.consoleLog("\n\n-------------- Force IDLING CRAWLER MANAGER due to timeout --------------\n\n");
            s.manager?.stop();

            /* or terniminate process after a delayed time */
            setTimeout(function () {

                const finishedAt = Date.now();
                s.session.state = "finished";
                s.session.finishedAt = new Date(finishedAt);
                s.session.duration = finishedAt - startedAt;
                s.session.counter = s.manager?.counter;
                LoggingUtil.consoleLog("Crawl process duration: " + (finishedAt - startedAt));
                LoggingUtil.consoleLog("\n\n-------------- Force TERNIMINATING PROCESS due to timeout --------------\n\n");
                Logger.writeCronLog(s.session).finally(() => {
                    process.exit(0);
                })

            }, waitToKillProcessTimeout);

        }, maxTimeout);
        return await this.waitOnFinish();
    }
}

var script = new CrawlScript();
script.run().then(result => {
    LoggingUtil.consoleLog(result);
}).catch(e => {
    LoggingUtil.consoleLog("Task finished with an unhandled exception");
    LoggingUtil.consoleLog(e);
}).finally(() => {
    LoggingUtil.consoleLog("\n\n-------------- Force TERNIMINATING PROCESS because task finished --------------\n\n");
    process.exit(0);
});