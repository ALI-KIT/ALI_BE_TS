import { Reliable, Type } from "@core/repository/base/Reliable";
import { OGNewsParser, OpenGraphNewsCrawler } from "@crawler/base/OpenGraphNewsCrawler";
import { DbScript } from "@scripts/DbScript";
import { kMaxLength } from "buffer";
import SimpleCralwer from "simplecrawler";

export class TestLibSimpleCrawler extends DbScript<any> {
    protected async runInternal(): Promise<Reliable<any>> {
        const crawler = new SimpleCralwer("https://dantri.com.vn/");
        crawler.maxDepth = 2;
        crawler.filterByDomain = true;
        //crawler.scanSubdomains = true;
        //crawler.host = "https://dantri.com.vn/";
        crawler.on("fetchcomplete", function (queueItem, responseBody) {
            const content = responseBody.toString("utf-8");
            TestLibSimpleCrawler.parseContent(content);
        });
        crawler.on("discoverycomplete", function (q, r) {
            let x = 5;
        })
        crawler.start();
        await this.waitComplete(crawler);
        return Reliable.Success(null);
    }
    public static async parseContent(content: string) {
        const reliable = await new OGNewsParser().execute({ name: "dantri", displayName: "Dân Trí", url: "https://dantri.com.vn" }, content);
        let x = 5;
        if(reliable.type == Type.SUCCESS && reliable.data) {
            let y = 5;
        }
    }

    public waitComplete(crawler: SimpleCralwer) {
        return new Promise<void>(function (resolve, reject) {
            crawler.on("complete", function () {
                resolve();
            });
        });
    }

}

DbScript.exec(new TestLibSimpleCrawler());