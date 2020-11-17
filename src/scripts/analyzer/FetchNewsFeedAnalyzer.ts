import { Reliable, Type } from '@core/repository/base/Reliable';
import { DbScript } from '../DbScript';
import MongoClient from 'mongodb';

import { FindKeywords_In_Keywords_Analyzer, FindKeywords_In_RawContent_Analyzer, FindKeywords_In_Summary_Analyzer, FindKeywords_In_Title_Analyzer, GetDefaultKeywords, KeywordsAnalyzer } from './CommonAnalyzer';
import { FeedAnalyzer } from './FeedAnalyzer';
import { AliDbClient } from '@dbs/AliDbClient';
import LoggingUtil from '@utils/LogUtil';

const RUN_AT_START_UP = false;

/**
 * Tạo/Cập nhật danh sách tin tức với các keywords từ default location 
 */
export class FetchNewsFeedAnalyzer extends DbScript<any> {
    public async runInternal(): Promise<Reliable<any>> {
        await AliDbClient.connect();
        const defaultKeywordsReliable = await new GetDefaultKeywords().run();
        if (defaultKeywordsReliable.type == Type.FAILED) {
            return defaultKeywordsReliable;
        } else if (!defaultKeywordsReliable.data) {
            return Reliable.Failed("Could not get the default keywords");
        }
        const keywords = defaultKeywordsReliable.data;
        const sessionCode = new MongoClient.ObjectId().toHexString();
        const analyzers: FeedAnalyzer[] = [
            new FindKeywords_In_Keywords_Analyzer(sessionCode, keywords),
            new FindKeywords_In_Title_Analyzer(sessionCode, keywords),
            new FindKeywords_In_Summary_Analyzer(sessionCode, keywords),
            new FindKeywords_In_RawContent_Analyzer(sessionCode, keywords)
        ]

        for (const analyzer of analyzers) {
            LoggingUtil.consoleLog("Running analyzer [" + analyzer.name + "]");
            const reliable = await analyzer.run();
            if (reliable.type == Type.FAILED) {
                return reliable
            }
        }

        // now we remove all documents having score = 0
        const removeResult = await AliDbClient.getInstance().useALIDB().collection("server-analyzer-data").deleteMany({ sessionCode: { $ne: sessionCode } })
        LoggingUtil.consoleLog("Remove " + removeResult.deletedCount + " expired documents");

        return Reliable.Success(null);
    }

}

if (RUN_AT_START_UP) {
    new FetchNewsFeedAnalyzer().run().then((reliable) => {
        LoggingUtil.consoleLog("Task finished with below data: ");
        LoggingUtil.consoleLog(reliable)
    }).catch(e => {
        LoggingUtil.consoleLog(e);
    }).finally(() => {
        process.exit(0);

    })
}
