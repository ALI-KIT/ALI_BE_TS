import { Reliable } from "@core/repository/base/Reliable";
import { DynamicSourceOGNewsCrawler } from "@crawler/base/OpenGraphNewsCrawler";
import { TuoiTreSitemapCrawler } from "@crawler/base/SitemapNewsCrawler";
import CrawlerScript from "@crawler/CrawlerScript";
import { AliAggregatorCrawler } from "@crawler/impl/AliAggregatorCrawler";
import { BaoMoiNewsDetailCrawler as BaoMoiXemTinOpenGraphCrawler } from "@crawler/impl/BaoMoiNewsDetailCrawler";
import { BaoMoiTinMoiCrawler } from "@crawler/impl/BaoMoiTinMoiCrawler";
import { BaoMoiXemTinCrawler } from "@crawler/impl/BaoMoiXemTinCrawler";
import DynamicNewsSourceGetterCrawler from "@crawler/impl/DynamicSourceGetterCrawler";
import { DbScript } from "@scripts/DbScript";

/**
 * Test crawling multiple sites with a crawler manager
 */
class TestCrawlerScript extends CrawlerScript {
    public onCreateCrawlers() {
        if (this.manager) {
            this.manager.isCachingResultInsteadOfSaving = true;
            this.manager.isAllowRecursion = true;
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
        const tin = new DynamicSourceOGNewsCrawler("https://www.tienphong.vn/xa-hoi/chan-dung-nu-thong-doc-dau-tien-cua-ngan-hang-nha-nuoc-1748883.tpo");
        const result = await tin.execute();
        return result;
    }

}

DbScript.exec(new TestCrawlerScript());