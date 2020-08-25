import '@loadenv';
import { CrawlerManager } from "./base/CrawlerManager";
import { BaoMoiTinMoiCrawler } from './impl/BaoMoiTinMoiCrawler';

import mongoose from 'mongoose'
import '@mongodb';

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
        mongoose.disconnect().then(() => {
            console.log("mongodb disconnected")
        })
    } catch(e) {
        console.log("exception when trying to disconnect mongodb: "+e)
    }
}

manager.addNewCrawler(new BaoMoiTinMoiCrawler(1));
console.log("end line")