import { AppProcessEnvironment } from '@loadenv';
import { NewsDao } from '@daos/News/NewsDao';
import { NewsDao as News2Dao } from '@daos/News2/News2Dao';
import UserDao from '@daos/User/UserDao';
import CrawlUtil from '@utils/CrawlUtils';
import { PlaceDao } from './PlaceDao';
import { Reliable, Type } from '@core/repository/base/Reliable';
import { MongoDbConnector } from '@mongodb';
import { Dao } from './Dao';
import { TrendsRating, TrendsRatingDocument, TrendsRatingSchema } from '@entities/TrendsRating';

/**
 * Object Modeling Database for Backend App ( & App Analytics also)
 */
export default class AppDatabase {
    public readonly newsDao = new NewsDao();
    public readonly news2Dao = new News2Dao();
    public readonly placeDao = new PlaceDao();
    public readonly userDao: UserDao = new UserDao();

    public readonly trendsRatingDao = new Dao<TrendsRatingDocument>("trends-rating", TrendsRatingSchema);

    private constructor() { }

    private static instance: AppDatabase;

    public static getInstance(): AppDatabase {
        if (!AppDatabase.instance) {
            AppDatabase.instance = new AppDatabase();
        }

        return AppDatabase.instance;
    }

    public static async waitInstance(): Promise<AppDatabase> {
        await MongoDbConnector.connect();
        return AppDatabase.getInstance();
    }

    public async initInternal(): Promise<Reliable<any>> {
        const appBeAnalyticsConnection = await CrawlUtil.connectMongoose(AppProcessEnvironment.BACKEND_URI);

        if (appBeAnalyticsConnection.type == Type.FAILED || !appBeAnalyticsConnection.data) {
            return appBeAnalyticsConnection;
        }

        const connection = appBeAnalyticsConnection.data;
        const dbConnection = connection.useDb("ALI-DB");

        const reliables: Reliable<any>[] = [
            await this.newsDao.init(dbConnection),
            await this.news2Dao.init(dbConnection),
            await this.userDao.init(dbConnection),
            await this.placeDao.init(dbConnection),
            await this.trendsRatingDao.init(dbConnection)];

        for (let i = 0; i < reliables.length; i++) {
            if (reliables[i].type == Type.FAILED) {
                return reliables[i];
            }
        }
        return Reliable.Success(null);
    }

    public static async init(): Promise<Reliable<any>> {
        return await AppDatabase.getInstance().initInternal();
    }
}