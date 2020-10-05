import { injectable, inject } from "inversify";
import "reflect-metadata";

import { NewsRepository } from '../base/NewsRepository';
import { Reliable } from '../base/Reliable';
import { News } from '@entities/News2';
import AppDatabase from '@daos/AppDatabase';
import { AliDbClient } from '@dbs/AliDbClient';

@injectable()
export class NewsRepositoryImpl implements NewsRepository {

    async getNewsFeed(locationCodes: string[], keywords: string[], limit: number, skip: number): Promise<Reliable<Array<News>>> {
        /** Lấy keywords từ locationCode */
        const keywordsFromLocations = await this.getKeywordsByLocationCode(locationCodes);
        if (keywordsFromLocations.data) {
            keywords = [...keywordsFromLocations.data!, ...keywords];
        }

        try {
            const result = await AppDatabase.getInstance().news2Dao.model
                .find(keywords.length == 0 ? {} : { keywords: { $in: keywords } })
                .sort({ publicationDate: -1 })
                .limit(limit)
                .skip(skip);
            return Reliable.Success(result)
        } catch (e) {
            return Reliable.Failed("Could not get news feed", e);
        }

    }

    public async getKeywordsByLocationCode(locationCodes: string[]): Promise<Reliable<string[]>> {
        const result: string[] = [];

        /** chúng ta sẽ sử dụng default location nếu location không được cung cấp sẵn */
        if (locationCodes.length == 0) {
            const serverState = await AliDbClient
                .getInstance()
                .useServerConfig()
                .collection("server-state")
                .findOne({ name: "server-common-state" });
            if (serverState && serverState.locationCode && typeof (serverState.locationCode) === 'string') {
                locationCodes.push(serverState.locationCode);
            }
        }

        for (var i = 0; i < locationCodes.length; i++) {
            const location = await AliDbClient
                .getInstance()
                .useServerConfig()
                .collection("server-location-data")
                .findOne({ code: locationCodes[i] });

            if (location && location.keywords && Array.isArray(location.keywords)) {
                const keywords = Array.from(location.keywords);
                keywords.forEach(element => {
                    if (typeof (element) === 'string' && !result.includes(element)) {
                        result.push(element);
                    }
                });
            }
        }

        return Reliable.Success(result);
    }

}