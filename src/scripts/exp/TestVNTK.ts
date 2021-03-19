import { Reliable, Type } from "@core/repository/base/Reliable";
import { GetNewsFeed, Param } from "@core/usecase/common/GetNewsFeed";
import { DbScript } from "@scripts/DbScript";
import { wordTokenizer } from 'vntk';

export class TestVNTK extends DbScript<any> {
    protected async runInternal(): Promise<Reliable<any>> {
        const params = new Param(250, 0);
        const feedsReliable = await new GetNewsFeed().invoke(params);

        if (feedsReliable.type == Type.FAILED || !feedsReliable.data) {
            return feedsReliable;
        }
        const input = feedsReliable.data.map(feed => feed.title + " " + feed.summary);
        const tokenizer = wordTokenizer();
        const map: Map<string, number> = new Map();

        input.forEach(s => {
            const result = tokenizer.tag(s);
            if (Array.isArray(result)) {
                result.forEach(word => {
                    if (!map.has(word)) {
                        map.set(word, 0);
                    }
                    map.set(word, map.get(word) + 1);
                });
            }
        });

        const output = [] as Array<{ text: string, count: number }>;
        map.forEach((value, key) => {
            output.push({ text: key, count: value });
        });

        output.sort((item1, item2) => item2.count - item1.count)

        return Reliable.Success(output);
    }

}

DbScript.exec(new TestVNTK());