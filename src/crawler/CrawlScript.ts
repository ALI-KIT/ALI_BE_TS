import '@loadenv';
import { CrawlerManager } from "./base/CrawlerManager";
import { BaoMoiTinMoiCrawler } from './impl/BaoMoiTinMoiCrawler';

import mongoose from 'mongoose'
import '@mongodb';
import { AliDbClient } from '@dbs/AliDbClient';

const manager: CrawlerManager = CrawlerManager.getInstance('app-crawler-manager');
manager.isAllowRecursion = false

var initted = false;

manager.onActive = () => {
    console.log("manager is on active");
    initted = true;
}

manager.onIdle = () => {
    if(!initted) return;
    console.log("manager is on idle");
    try {
        const mongoosePromise = mongoose.disconnect();
        const mongoDbPromise = AliDbClient.disconnect();

        Promise.all([mongoosePromise, mongoDbPromise]).then(() => {
            console.log("mongodb disconnected")
        })
    } catch(e) {
        console.log("exception when trying to disconnect mongodb: "+e)
    }
}

manager.addNewCrawler(new BaoMoiTinMoiCrawler(1));

/* Force terniminating the process after 1 hour of running */
const maxTimeout = 1 * 60 * 60 * 1000;
const waitToKillProcessTimeout =  5 * 60 * 1000;

setTimeout(function() {
    if(!initted) return;
    /* try to stop the manager */ 
    console.log("\n\n-------------- Force IDLING CRAWLER MANAGER due to timeout --------------\n\n");
    manager.stop();

    /* or terniminate process after 5 minute of waiting time */
    setTimeout(function() {
    console.log("\n\n-------------- Force TERNIMINATING PROCESS due to timeout --------------\n\n");
        process.exit(0)
    }, waitToKillProcessTimeout);

}, maxTimeout);

console.log("end of line");