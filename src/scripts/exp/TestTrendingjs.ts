import { Reliable, Type } from "@core/repository/base/Reliable";
import { GetNewsFeed, Param } from "@core/usecase/common/GetNewsFeed";
import { DbScript } from "@scripts/DbScript";
import trendingjs from "trendingjs";

export class TestTrendingjs extends DbScript<any> {
    protected async runInternal(): Promise<Reliable<any>> {
        const params = new Param(1000, 0);
        const feedsReliable = await new GetNewsFeed().invoke(params);

        if (feedsReliable.type == Type.FAILED || !feedsReliable.data) {
            return feedsReliable;
        }
        const input = feedsReliable.data.map(feed => feed.title + ". " + feed.summary);

        const trends = trendingjs(input, 100, { minWord: 10, wordChain: 4, intelligenceMode: true });
        return Reliable.Success(trends);
    }

}

DbScript.exec(new TestTrendingjs());