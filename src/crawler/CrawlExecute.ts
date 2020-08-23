import '@loadenv';
import cron from 'cron';
import { CrawlerManager } from "./base/CrawlerManager";
import { BaoMoiTinMoiCrawler } from './impl/BaoMoiTinMoiCrawler';

import '@mongodb'



const job = new cron.CronJob({
    cronTime: '0 0 */4 * *', 
    onTick: function () {
        const manager: CrawlerManager = new CrawlerManager('app-crawler-manager');
        manager.isAllowRecursion = false
        manager.addNewCrawler(new BaoMoiTinMoiCrawler(1));
        console.log('Cron jub runing...');
    },
    start: true,
    timeZone: 'Asia/Ho_Chi_Minh' 
});

job.start();
