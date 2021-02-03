import { Reliable, Type } from '@core/repository/base/Reliable';
import { DbScript } from '../DbScript';
import MongoClient from 'mongodb';

import { FindKeywords_In_Keywords_Analyzer, FindKeywords_In_RawContent_Analyzer, FindKeywords_In_Summary_Analyzer, FindKeywords_In_Title_Analyzer, GetDefaultKeywords, KeywordsAnalyzer } from './Commons';
import { FeedAnalyzer } from './FeedAnalyzer';
import LoggingUtil from '@utils/LogUtil';
import { MongoDbBackendClient } from '@daos/MongoDbBackendClient';
import { MongoDbCrawlerClient } from '@daos/MongoDbCrawlerClient';
import { CrawlerToBackendSaveNewsFeed } from './CrawlerToBackendSaveNewsFeeds';

const RUN_AT_START_UP = false;

/**
 * Lấy tin tức lọc theo keywords từ Crawler Database về Backend Database
 * Tạo/Cập nhật danh sách tin tức với các keywords cho sẵn
 */
export class CrawlerToBackend_FetchNewsFeed_Analyzer extends DbScript<any> {

    public async runInternal(): Promise<Reliable<any>> {
        const newsCollection: MongoClient.Collection = (await MongoDbCrawlerClient.waitInstance()).useALIDB().collection("news-2");
        const analyticsCollection: MongoClient.Collection = (await MongoDbBackendClient.waitInstance()).useALIDB().collection("server-analyzer-data-crawler-to-backend");

        const defaultKeywordsReliable = await new GetDefaultKeywords().run();
        if (defaultKeywordsReliable.type == Type.FAILED) {
            return defaultKeywordsReliable;
        } else if (!defaultKeywordsReliable.data) {
            return Reliable.Failed("Could not get the default keywords");
        }
        const keywords = defaultKeywordsReliable.data;
        const sessionCode = new MongoClient.ObjectId().toHexString();

        const analyzers: FeedAnalyzer[] = [
            new FindKeywords_In_Keywords_Analyzer(newsCollection, analyticsCollection, sessionCode, keywords),
            new FindKeywords_In_Title_Analyzer(newsCollection, analyticsCollection, sessionCode, keywords),
            new FindKeywords_In_Summary_Analyzer(newsCollection, analyticsCollection, sessionCode, keywords),
            new FindKeywords_In_RawContent_Analyzer(newsCollection, analyticsCollection, sessionCode, keywords)
        ]

        for (const analyzer of analyzers) {
            LoggingUtil.consoleLog("Running analyzer [" + analyzer.name + "]");
            const reliable = await analyzer.run();
            if (reliable.type == Type.FAILED) {
                return reliable
            }
        }

        // now we remove all documents which weren't created or updated in curren session
        const removeResult = await (await MongoDbBackendClient.waitInstance()).useALIDB().collection("server-analyzer-data-crawler-to-backend").deleteMany({ sessionCode: { $ne: sessionCode } })
        LoggingUtil.consoleLog("Remove " + removeResult.deletedCount + " expired documents");

        // final step
        // update new-fetched-news to backend-news
        const result = await new CrawlerToBackendSaveNewsFeed(analyticsCollection, sessionCode).run()
        return result;
    }

}

if (RUN_AT_START_UP) {
    new CrawlerToBackend_FetchNewsFeed_Analyzer().run().then((reliable) => {
        LoggingUtil.consoleLog("Task finished with below data: ");
        LoggingUtil.consoleLog(reliable)
    }).catch(e => {
        LoggingUtil.consoleLog(e);
    }).finally(() => {
        process.exit(0);

    })
}
