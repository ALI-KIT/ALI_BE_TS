import { AppProcessEnvironment } from '@loadenv';
import { NewsDao } from '@daos/News2/News2Dao';
import CrawlUtil from '@utils/CrawlUtils';
import { Reliable, Type } from '@core/repository/base/Reliable';
import { BeAnalyticsServer, BeAnalyticsServerSchema } from '@entities/BeAnalyticsServer';
import { Dao } from './Dao';


/**
 * Object Modeling Database for Crawler App
 */
export default class CrawlerDatabase {
    public news2Dao: NewsDao = new NewsDao();
    public beAnalyticsServerDao = new Dao<BeAnalyticsServer>("server-be-analytics", BeAnalyticsServerSchema);

    private constructor() { }

    private static instance: CrawlerDatabase;

    public async initInternal(): Promise<Reliable<any>> {
        const crawlerConnection = await CrawlUtil.connectMongoose(AppProcessEnvironment.NEWS_CRAWLER_URI);
        const serverConfigConnection = await CrawlUtil.connectMongoose(AppProcessEnvironment.CONFIG_DB_URI);
        if (crawlerConnection.type == Type.FAILED || !crawlerConnection.data) {
            return crawlerConnection;
        }

        if (serverConfigConnection.type == Type.FAILED || !serverConfigConnection.data) {
            return serverConfigConnection;
        }

        const news2DaoReliable = await this.news2Dao.init(crawlerConnection.data.useDb("ALI-DB"));

        if (news2DaoReliable.type == Type.FAILED) {
            return news2DaoReliable;
        }

        const serverConfigDbConnection = serverConfigConnection.data.useDb("SERVER-CONFIG");
        const basDaoReliable = await this.beAnalyticsServerDao.init(serverConfigDbConnection);

        if (basDaoReliable.type == Type.FAILED) {
            return basDaoReliable;
        }

        return Reliable.Success(null);

    }

    public static getInstance(): CrawlerDatabase {
        if (!CrawlerDatabase.instance) {
            CrawlerDatabase.instance = new CrawlerDatabase();
        }

        return CrawlerDatabase.instance;
    }

    public static async init(): Promise<Reliable<any>> {
        let reliable: Reliable<any>;
        try {
            reliable = await CrawlerDatabase.getInstance().initInternal();
        } catch (e) {
            reliable = Reliable.Failed("Failed to init CrawlerDatabase", e);
        }
        return reliable;
    }

}