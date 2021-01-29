import { Reliable } from "@core/repository/base/Reliable";
import { DynamicSourceOGNewsCrawler } from "@crawler/base/OpenGraphNewsCrawler";
import CrawlerScript from "@crawler/CrawlerScript";
import DynamicNewsSourceGetterCrawler from "@crawler/impl/DynamicSourceGetterCrawler";
import { DbScript } from "@scripts/DbScript";

/**
 * Test crawling multiple sites with a crawler manager
 */
class TestCrawlerScript extends CrawlerScript {
    public onCreateCrawlers() {
        if (this.manager) {
            this.manager.isCachingResultInsteadOfSaving = true;
            this.manager.isAllowRecursion = false;
        }
        return [
            new DynamicNewsSourceGetterCrawler(false, [])
        ]
    }

    public async runInternal(): Promise<Reliable<any>> {
        await super.runInternal();
        const result = Reliable.Success(this.manager!!.cachingResult)

        return result;
    }
}

/**
 * Test crawling a site with a crawler (without managing by a manager)
 */
export default class TestSingleCrawlerScript extends DbScript<any> {
    protected async runInternal(): Promise<Reliable<any>> {
        const tin = new DynamicSourceOGNewsCrawler("https://www.24h.com.vn/cong-nghe-thong-tin/hot-intel-bom-them-gan-nua-ti-usd-vao-nha-may-chipset-tai-tpthu-duc-c55a1221425.html");
        const result = await tin.execute();
        return result;
    }

}

DbScript.exec(new TestSingleCrawlerScript());