import { CrawlerManager } from "./base/CrawlerManager";
import { BaoMoiTinMoiCrawler } from './impl/BaoMoiTinMoiCrawler';

import '@mongodb'

const manager: CrawlerManager = new CrawlerManager('app-crawler-manager');
manager.isAllowRecursion = false
manager.addNewCrawler(new BaoMoiTinMoiCrawler(1));
