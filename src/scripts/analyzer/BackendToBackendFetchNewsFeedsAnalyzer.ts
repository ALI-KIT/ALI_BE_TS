import { Reliable, Type } from '@core/repository/base/Reliable';
import { DbScript } from '../DbScript';
import MongoClient from 'mongodb';

import { FindKeywords_In_Keywords_Analyzer, FindKeywords_In_RawContent_Analyzer, FindKeywords_In_Summary_Analyzer, FindKeywords_In_Title_Analyzer, GetDefaultKeywords, KeywordsAnalyzer } from './Commons';
import { FeedAnalyzer } from './FeedAnalyzer';
import LoggingUtil from '@utils/LogUtil';
import { MongoDbBackendClient } from '@daos/MongoDbBackendClient';

const RUN_AT_START_UP = false;

/**
 * Tạo/Cập nhật danh sách tin tức với các keywords cho sẵn
 */
export class BackendToBackendFetchNewsFeedsAnalyzer extends DbScript<any> {

    public async runInternal(): Promise<Reliable<any>> {
        const newsCollection: MongoClient.Collection = MongoDbBackendClient.getInstance().useALIDB().collection("news-2");
        const analyticsCollection: MongoClient.Collection = MongoDbBackendClient.getInstance().useALIDB().collection("server-analyzer-data");

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

        // now we remove all documents having score = 0
        const removeResult = await MongoDbBackendClient.getInstance().useALIDB().collection("server-analyzer-data").deleteMany({ sessionCode: { $ne: sessionCode } })
        LoggingUtil.consoleLog("Remove " + removeResult.deletedCount + " expired documents");

        return Reliable.Success(null);
    }

}

if (RUN_AT_START_UP) {
    new BackendToBackendFetchNewsFeedsAnalyzer().run().then((reliable) => {
        LoggingUtil.consoleLog("Task finished with below data: ");
        LoggingUtil.consoleLog(reliable)
    }).catch(e => {
        LoggingUtil.consoleLog(e);
    }).finally(() => {
        process.exit(0);

    })
}
