import { Reliable, Type } from '@core/repository/base/Reliable';
import { DbScript } from './DbScript';

import { FindKeywords_In_Keywords_Analyzer, FindKeywords_In_RawContent_Analyzer, GetDefaultKeywords, KeywordsAnalyzer } from './analyzer/CommonAnalyzer';
import { FeedAnalyzer } from './analyzer/FeedAnalyzer';
import { AliDbClient } from '@dbs/AliDbClient';
/**
 * Tạo/Cập nhật danh sách tin tức với các keywords từ default location 
 */
export class FetchNewsFeedAnalyzer extends DbScript {
    private connectionString = "mongodb+srv://user1:123455@ali-db.gyx2c.gcp.mongodb.net/";
    private dbString = "SERVER-CONFIG";
    public async run(): Promise<Reliable<any>> {
        await AliDbClient.connect();
        const defaultKeywordsReliable = await new GetDefaultKeywords().run();
        if (defaultKeywordsReliable.type == Type.FAILED) {
            return defaultKeywordsReliable;
        } else if (!defaultKeywordsReliable.data) {
            return Reliable.Failed("Could not get the default keywords");
        }
        const keywords = defaultKeywordsReliable.data;
        const analyzers: FeedAnalyzer[] = [
            new FindKeywords_In_Keywords_Analyzer(keywords),
            new FindKeywords_In_RawContent_Analyzer(keywords)
        ]

        for (const analyzer of analyzers) {
            console.log("Running analyzer [" + analyzer.name + "]");
            const reliable = await analyzer.run();
            if (reliable.type == Type.FAILED) {
                return reliable
            }
        }
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
