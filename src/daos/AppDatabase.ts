import { NewsDao } from '@daos/News/NewsDao';
import {NewsDao as News2Dao} from '@daos/News2/News2Dao';
import { PlaceDao } from '@daos/PlaceDao';

export default class AppDatabase {
    public newsDao = new NewsDao();
    public news2Dao = new News2Dao();
    public placeDao = new PlaceDao();
    
    
    private constructor() {}

    private static instance: AppDatabase;
    
    
    public static getInstance(): AppDatabase {
        if (!AppDatabase.instance) {
            AppDatabase.instance = new AppDatabase();
        }

        return AppDatabase.instance;
    }
}