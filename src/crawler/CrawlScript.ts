import '@loadenv';
import '@mongodb';

import { CrawlerManager } from "./base/CrawlerManager";
import { BaoMoiTinMoiCrawler } from './impl/BaoMoiTinMoiCrawler';

import { Logger } from '@utils/AppDbLogging';
import { State } from './base/Crawler';
import { AliAggregatorCrawler } from './impl/AliAggregatorCrawler';
import { Reliable } from '@core/repository/base/Reliable';

class CrawlScript {
    public session: any;
    public manager?: CrawlerManager;
    public isInitted() {
        return this.manager && this.session && this.manager.status != State.PENDING;
    }

    public async waitOnFinish(): Promise<Reliable<any>> {
        // wait the crawler manager to idle (finished)
        await this.manager?.waitToIdle();

        console.log("manager is on idle");
        const finishedAt = Date.now();
        this.session.state = "finished";
        this.session.finishedAt = new Date(finishedAt);
        this.session.duration = finishedAt - this.session.startedAt;

        console.log("Crawl process duration: " + (finishedAt - this.session.startedAt));
        console.log("CrawlingListSize = " + this.manager?.crawlingList.length);
        if (this.manager?.crawlingList.length == 1) {
            console.log(this.manager?.crawlingList[0]);
        }
        console.log("CrawlUrlListSize = " + this.manager?.crawlUrlList.length);
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
                console.log("manager is on active");
        };

        await this.manager.addNewCrawler(new AliAggregatorCrawler());
        //await this.manager.addNewCrawler(new BaoMoiTinMoiCrawler(1));

        /* Force idling crawler manager or terniminating the process after timeout duration */

        const s = this;
        setTimeout(function () {
            if (!s.isInitted()) return;
            /* try to stop the manager */
            console.log("\n\n-------------- Force IDLING CRAWLER MANAGER due to timeout --------------\n\n");
            s.manager?.stop();

            /* or terniminate process after a delayed time */
            setTimeout(function () {

                const finishedAt = Date.now();
                s.session.state = "finished";
                s.session.finishedAt = new Date(finishedAt);
                s.session.duration = finishedAt - startedAt;
                s.session.counter = s.manager?.counter;
                console.log("Crawl process duration: " + (finishedAt - startedAt));
                console.log("\n\n-------------- Force TERNIMINATING PROCESS due to timeout --------------\n\n");
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
    console.log(result);
}).catch(e => {
    console.log("Task finished with an unhandled exception");
    console.log(e);
}).finally(() => {
    console.log("\n\n-------------- Force TERNIMINATING PROCESS because task finished --------------\n\n");
    process.exit(0);
});