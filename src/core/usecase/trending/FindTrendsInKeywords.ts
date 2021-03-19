import { Reliable, Type } from "@core/repository/base/Reliable";
import { News } from "@entities/News2";
import { GetFullKeywordsData } from "../common/GetFullKeywordsData";
import { GetNewsFeed, Param } from "../common/GetNewsFeed";
import { GetExceptTrendsRating } from "./GetExceptTrendsRating";

export class FindTrendsInKeywords {
    public async invoke(feeds: News[] = undefined): Promise<Reliable<{ text: string, count: number }[]>> {

        let keywordsArray: string[][];

        //TODO: add a date-time range condition
        if (!feeds) {
            const feedsReliable = await new GetNewsFeed().invoke(new Param(300, 0));

            if (feedsReliable.type == Type.FAILED || !feedsReliable.data) {
                return Reliable.Failed(feedsReliable.message, feedsReliable.error);
            }
            keywordsArray = feedsReliable.data.map(news => news.keywords);

        } else {
            keywordsArray = feeds.map(news => news.keywords);
        }

        const map: Map<string, number> = new Map();

        keywordsArray.forEach(keywords => {
            keywords.forEach(word => {
                if (!map.has(word)) {
                    map.set(word, 0);
                }
                map.set(word, map.get(word) + 1);
            }
            )
        });

        const output = [] as Array<{ text: string, count: number }>;
        map.forEach((value, key) => {
            output.push({ text: key, count: value });
        });

        output.sort((item1, item2) => item2.count - item1.count);

        const reallyOutput = [] as { text: string, count: number }[];

        // we may remove initial_keyword in the list
        // remove any no-meaning keywords
        // the list size is no more than 40 items

        const appKeywordData = await new GetFullKeywordsData().invoke();

        if (appKeywordData.type == Type.FAILED || !appKeywordData.data) {
            return Reliable.Failed(appKeywordData.message, appKeywordData.error);
        }

        const initial_keywords = appKeywordData.data.initial_keywords || [];

        const exceptConfig = (await new GetExceptTrendsRating().invoke()).data || [];

        const except: string[] = [...initial_keywords, ...exceptConfig].map(k => k.toLowerCase());
        // additions: gom nhóm các keywords tương tự nhau, giữ lại keywords có count lớn nhất và count = sum()
        var lastCount = 0;
        for (let i = 0; i < output.length; i++) {
            const item = output[i];
            /* too few appeared item will be ignored */
            if (item.count < 10 && reallyOutput.length > 10) {
                break;
            }

            if (reallyOutput.length > 40) {
                break;
            }

            if (except.includes(item.text.toLowerCase())) {
                continue;
            }

            reallyOutput.push(item);
        }

        return Reliable.Success(reallyOutput);
    }
}