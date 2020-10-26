import { Reliable, Type } from '@core/repository/base/Reliable';
import { DbScript } from '../DbScript';
import MongoClient from 'mongodb';

import { FindKeywords_In_Keywords_Analyzer, FindKeywords_In_RawContent_Analyzer, FindKeywords_In_Summary_Analyzer, FindKeywords_In_Title_Analyzer, GetDefaultKeywords, KeywordsAnalyzer } from './CommonAnalyzer';
import { FeedAnalyzer } from './FeedAnalyzer';
import { AliDbClient } from '@dbs/AliDbClient';
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
            console.log("Running analyzer [" + analyzer.name + "]");
            const reliable = await analyzer.run();
            if (reliable.type == Type.FAILED) {
                return reliable
            }
        }

        // now we remove all documents having score = 0
        const removeResult = await AliDbClient.getInstance().useALIDB().collection("server-analyzer-data").deleteMany({ sessionCode: { $ne: sessionCode } })
        console.log("Remove " + removeResult.deletedCount + " expired documents");

        return Reliable.Success(null);
    }

}

new FetchNewsFeedAnalyzer().run().then((reliable) => {
    console.log("Task finished with below data: ");
    console.log(reliable)
}).catch(e => {
    console.log(e);
}).finally(() => {
    process.exit(0);

})
