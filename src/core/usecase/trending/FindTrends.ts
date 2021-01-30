import { Reliable, Type } from "@core/repository/base/Reliable";
import { GetNewsFeed, Param } from "../common/GetNewsFeed";
import { CountTrendsInNewsFeeds } from "./CountTrendsInNewsFeeds";
import { FindTrendsInKeywords } from "./FindTrendsInKeywords";

export class FindTrends {
    public async invoke(): Promise<Reliable<{ text: string, count: number }[]>> {

        // First: get first 1000 news feeds
        const feedsReliable = await new GetNewsFeed().invoke(new Param(300, 0));

        if (feedsReliable.type == Type.FAILED || !feedsReliable.data) {
            return Reliable.Failed(feedsReliable.message, feedsReliable.error);
        }

        // retrieve first 40 trending words in keywords data
        const trendInKeywords = await new FindTrendsInKeywords().invoke(feedsReliable.data);

        if (trendInKeywords.type == Type.FAILED || !trendInKeywords.data) {
            return Reliable.Failed(trendInKeywords.message, trendInKeywords.error);
        }

        // TODO: Maybe a vntk entity-named-recognition scanning the new feeds here
        // to find more keywords

        // enhance trending words by news feed title and summary
        const trends = trendInKeywords.data.map(trend => trend.text);
        const countTrends = await new CountTrendsInNewsFeeds().invoke(trends, feedsReliable.data);

        const output = trendInKeywords.data.map(trendKeyword => {
            const trendNewsFeeds = countTrends.data.find(item => item.text == trendKeyword.text);
            return { text: trendKeyword.text, count: trendKeyword.count * 2 + (trendNewsFeeds ? trendNewsFeeds.count : 0) }
        });

        output.sort((item1, item2) => item2.count - item1.count);

        return Reliable.Success(output);
    }
}