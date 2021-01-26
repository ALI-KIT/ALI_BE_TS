
import { TYPES_USECASES } from '@core/di/Types';
import { Reliable, Type } from '@core/repository/base/Reliable';
import { DbScript } from '@scripts/DbScript';
import LoggingUtil from '@utils/LogUtil';
import container from '@core/di/InversifyConfigModule';
import { compareTwoStrings } from 'string-similarity';
import MongoClient from 'mongodb';
import similarity from 'similarity';
import leven from 'leven';
import clustering from 'set-clustering';
import { GetAnalyzerData, Params } from '@core/usecase/common/GetAnalyzerData';
import { GetNewsFeed, Param } from '@core/usecase/common/GetNewsFeed';
import { News } from '@entities/News2';
import { FeShortFeed } from '@entities/fe/FeFeed';
import { MongoDbBackendClient } from '@daos/MongoDbBackendClient';

const RUN_AT_START_UP = false;

/**
 * + Lấy list tin quận 9 (analyzer news)
 * + Chia chúng thành các group với mỗi group là các tin tương tự nhau
 * + Lưu vào database "analyzer-similarity"
 */
export class GroupingBySimilarity extends DbScript<any> {
    private getNewFeeds: GetNewsFeed = container.get<GetNewsFeed>(TYPES_USECASES.GetNewsFeed);

    findSimilarity(x: {
        trendingIndex: number,
        news: News,
        text: string;
    }, y: {
        trendingIndex: number,
        news: News,
        text: string;
    }): number {
        return compareTwoStrings(x.text, y.text);
    }
    public async runInternal(): Promise<Reliable<any>> {
        const sessionCode = new MongoClient.ObjectId().toHexString();

        const param = new Param( 0, 0);
        const findInContent = false;

        const listReliable = await this.getNewFeeds.invoke(param);
        if (listReliable.type == Type.FAILED || !listReliable.data) {
            return listReliable;
        }

        const items = listReliable.data!.map((news, index) => {
            return {
                trendingIndex: index,
                news: news,
                text: news.title + " " + news.summary + (findInContent ? " " + news.rawContent : "") || ""
            }
        });


        // grouping
        const groups = clustering(items, this.findSimilarity);
        const similarGroups = groups.similarGroups(0.45);
        const similarFeeds: {
            sessionCode: string,
            index: number,
            data: FeShortFeed[]
        }[] = [];

        if (Array.isArray(similarGroups)) {
            similarGroups.forEach((group, index) => {
                if (Array.isArray(group)) {
                    const newsGroup: {
                        sessionCode: string,
                        index: number,
                        data: FeShortFeed[]
                    } = {
                        sessionCode,
                        index: index,
                        data: []
                    };

                    // sort group by trending score
                    const sortedGroup = group.sort((a, b) => a.trendingIndex - b.trendingIndex);
                    if (sortedGroup.length != 0) {
                        newsGroup.index = sortedGroup[0].trendingIndex;
                    }

                    // push each new(FeShortFeed) to newsGroup
                    sortedGroup.forEach(block => {
                        if (block.news) {
                            const news: News = block.news;
                            if (news) {
                                newsGroup.data.push(FeShortFeed.of(news))
                            }
                        };
                    });
                    similarFeeds.push(newsGroup);

                };
            });
        };

        const sortedSimilarFeed = similarFeeds.sort((a, b) => a.index - b.index);

        sortedSimilarFeed.forEach((feeds, index) => {
            feeds.index = index;
        })

        // now save to database
        const collection = MongoDbBackendClient.getInstance().useALIDB().collection("analyzer-similarity");
        const saveResult = (sortedSimilarFeed.length != 0) ? await collection.insertMany(sortedSimilarFeed) : "Empty Similarity List";
        await collection.deleteMany({ sessionCode: { $ne: sessionCode } });


        return Reliable.Success(saveResult);
    }
}
if (RUN_AT_START_UP) {
    new GroupingBySimilarity().run().then((reliable) => {
        LoggingUtil.consoleLog("Task finished with below data: ");
        LoggingUtil.consoleLog(reliable)
    }).catch(e => {
        LoggingUtil.consoleLog(e);
    }).finally(() => {
        process.exit(0);

    })
}
