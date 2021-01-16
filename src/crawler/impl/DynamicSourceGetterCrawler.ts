import { Reliable, Type } from "@core/repository/base/Reliable";
import { Crawler } from "@crawler/base/Crawler";
import { NewsCrawler } from "@crawler/base/NewsCrawler";
import { DynamicNewsSourceGetter } from "@crawler/interactor/DynamicNewsSourceGetter";

export default class DynamicNewsSourceGetterCrawler extends Crawler<any> {
    public constructor(public isWhiteListOrBlackList: boolean, public filterList: string[] = []) {
        super("", "");

    }
    public async execute(): Promise<Reliable<any>> {
        const reliable = await new DynamicNewsSourceGetter().run();
        if (reliable.type == Type.SUCCESS && reliable.data) {
            let allowed = true;

            for (let crawler of reliable.data) {
                if (this.isWhiteListOrBlackList) {
                    allowed = this.filterList.indexOf(crawler.name) != -1
                } else {
                    allowed = this.filterList.indexOf(crawler.name) == -1;
                }

                if (allowed) {
                    await this.manager?.addNewCrawler(crawler);
                }
            };
        }
        return Reliable.Success(null);
    }
    public async saveResult(result: any): Promise<Reliable<any>> {
        return Reliable.Success(null);
    }
}