import { Reliable, Type } from "@core/repository/base/Reliable";
import { News } from "@entities/News2";
import { GetNewsFeed, Param } from "../common/GetNewsFeed";

/**
 * Cho 1 list string
 * Đếm xem chúng xuất hiện bao nhiêu lần trong db và xếp theo thứ tự giảm dần
 */
export class CountTrendsInNewsFeeds {
    public async invoke(words: string[], feeds: News[] = undefined): Promise<Reliable<{ text: string, count: number }[]>> {

        //TODO: add a date-time range condition
        if (!feeds) {
            const feedsReliable = await new GetNewsFeed().invoke(new Param(1000, 0));

            if (feedsReliable.type == Type.FAILED || !feedsReliable.data) {
                return Reliable.Failed(feedsReliable.message, feedsReliable.error);
            }
            feeds = feedsReliable.data;
        }

        const map: Map<string, number> = new Map();

        const textFeeds = feeds.map(feed => feed.title + " \n " + feed.summary);

        words.forEach(word => {
            let i = 0;
            const textFeedsSize = textFeeds.length;
            for (i = 0; i < textFeedsSize; i++) {
                if (textFeeds[i].includes(word)) {
                    if (!map.has(word)) {
                        map.set(word, 0);
                    }
                    map.set(word, map.get(word) + 1);
                }
            }
        })

        const output = [] as Array<{ text: string, count: number }>;
        map.forEach((value, key) => {
            output.push({ text: key, count: value });
        });

        output.sort((item1, item2) => item2.count - item1.count);

        return Reliable.Success(output);
    }
}