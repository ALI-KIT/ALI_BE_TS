import '@loadenv';
import '@mongodb';

import { CrawlerManager } from "./base/CrawlerManager";
import { BaoMoiTinMoiCrawler } from './impl/BaoMoiTinMoiCrawler';

import { Logger } from '@utils/AppDbLogging';
import { State } from './base/Crawler';

class CrawlScript {
    public session: any;
    public manager?: CrawlerManager;
    public isInitted() {
        return this.manager && this.session && this.manager.status != State.PENDING;
    }

    public async run(): Promise<void> {
        const maxTimeout = 1 * 60 * 60 * 1000;
        const waitToKillProcessTimeout = 5 * 60 * 1000;
        const startedAt = Date.now();

        this.session = await Logger.writeCronLog({
            name: "crawl-script",
            startedAt: new Date(startedAt),
            finishedAt: null,
            duration: 0,
            state: "running",
            message: ""
        });

        this.manager = CrawlerManager.getInstance('app-crawler-manager');
        this.manager.isAllowRecursion = false;

        this.manager.onActive = () => {
            if (!this.isInitted())
                console.log("manager is on active");
        };

        this.manager.onIdle = () => {
            console.log("manager is on idle");
            const finishedAt = Date.now();
            this.session.state = "finished";
            this.session.finishedAt = new Date(finishedAt);
            this.session.duration = finishedAt - startedAt;
            Logger.writeCronLog(this.session)
                .catch(e => {})
                .finally(() => {
                    /* terniminate process */
                    console.log("\n\n-------------- Force TERNIMINATING PROCESS because crawler manager state is on idle --------------\n\n");
                    process.exit(0);
                });
        }

        this.manager.addNewCrawler(new BaoMoiTinMoiCrawler(1));

        /* Force idling crawler manager or terniminating the process after timeout duration */

        const s = this;
        setTimeout(function () {
            if (!s.isInitted()) return;
            /* try to stop the manager */
            console.log("\n\n-------------- Force IDLING CRAWLER MANAGER due to timeout --------------\n\n");
            s.manager?.stop();

            /* or terniminate process after a delayed time */
            setTimeout(function () {
                console.log("\n\n-------------- Force TERNIMINATING PROCESS due to timeout --------------\n\n");

                const finishedAt = Date.now();
                s.session.state = "finished";
                s.session.finishedAt = new Date(finishedAt);
                s.session.duration = finishedAt - startedAt;
                Logger.writeCronLog(s.session).finally(() =>{
                    process.exit(0);
                })

            }, waitToKillProcessTimeout);

        }, maxTimeout);
    }
}

var script = new CrawlScript();
script.run().catch(e => {
    console.log(e);
    console.log("Task finished with an exception.")
    process.exit(1);
});