
import { TYPES_USECASES } from '@core/di/Types';
import { Reliable, Type } from '@core/repository/base/Reliable';
import { GetNewsFeed, Param } from '@core/usecase/common/GetNewsFeed';
import { DbScript } from '@scripts/DbScript';
import LoggingUtil from '@utils/LogUtil';
import container from '@core/di/InversifyConfigModule';
import { compareTwoStrings } from 'string-similarity';
import similarity from 'similarity';
import leven from 'leven';
import clustering from 'set-clustering';

/**
 * + Lấy list tin quận 9
 * + Lấy tin bất kỳ trong list đó (Ex: Tin A).
 * + Sắp xếp các tin còn lại theo thứ tự tương tự theo tiêu đề.
 */
export class StringSimilar extends DbScript<any> {
    private getNewsFeed: GetNewsFeed = container.get<GetNewsFeed>(TYPES_USECASES.GetNewsFeed);

    findSimilarity(x: {
        title: string;
        source: string;
        aggregator: string;
        text: string;
    }, y: {
        title: string;
        source: string;
        aggregator: string;
        text: string;
    }): number {
        return compareTwoStrings(x.text, y.text);
    }
    public async runInternal(): Promise<Reliable<any>> {
        //const similar = compareTwoStrings("", "");
        const param = new Param([], [], 0, 0);
        const text = "Vụ bữa ăn bán trú: Lãnh đạo UBND quận 9 lên tiếng. UBND quận 9 thành lập tổ công tác liên ngành kiểm tra toàn diện đối nhà trường về công tác bán trú, làm rõ trách nhiệm của những người có liên quan."

        const listReliable = await this.getNewsFeed.invoke(param);
        if (listReliable.type == Type.FAILED || !listReliable.data) {
            return listReliable;
        }

        const items = listReliable.data!.map(news => { return { title: news.title, source: news.source?.name, aggregator: news.aggregator?.name, text: news.title + " " + news.summary /* +" "+news.rawContent  */ || "" } });
        const sorted = items.map(item => {
            return { text: item.title, source: item.source, aggregator: item.aggregator, score: compareTwoStrings(text, item.text) }
        }).sort((x, y) => (y.score - x.score));
        const result = sorted.length > 30 ? sorted.slice(0, 30) : sorted;

        // grouping
        const c = clustering(items, this.findSimilarity);
        const res2 = c.similarGroups(0.375);
        const res3: {
            title: string;
            source: string;
            aggregator: string;
            text: string;
        }[][] = [];

        if (Array.isArray(res2)) {
            res2.forEach(element => {
                if (Array.isArray(element)) {
                    const parsedElement: {
                        title: string;
                        source: string;
                        aggregator: string;
                        text: string;
                    }[] = [];
                    element.forEach(innerElement => {

                        if (innerElement.title && innerElement.text) {
                            parsedElement.push({
                                title: innerElement.title,
                                source: innerElement.source,
                                aggregator: innerElement.aggreagtor,
                                text: innerElement.text
                            });
                        }
                    })
                    res3.push(parsedElement);

                }
            });
        }

        const res4: string[][] = [];
        res3.forEach(e => {
            const se: string[] = [];
            e.forEach(ie => {
                se.push(ie.text);
            });
            res4.push(se);
        });

        res4.forEach(e => {
            if (e.length > 1) {
                LoggingUtil.consoleLog("\n---------------------\n")
                e.forEach(ie => {
                    LoggingUtil.consoleLog(" -> [" + ie + "]");
                })
            }
        })

        return Reliable.Success("Total " + res4.length + " groups of " + items.length + " items");
    }
}

new StringSimilar().run().then((reliable) => {
    LoggingUtil.consoleLog("Task finished with below data: ");
    LoggingUtil.consoleLog(reliable)
}).catch(e => {
    LoggingUtil.consoleLog(e);
}).finally(() => {
    process.exit(0);

})
