import { Reliable } from './Reliable';
import { injectable } from 'inversify';
import { News } from '@entities/News2';

export interface NewsRepository {
    getNewsFeed(locationCodes: string[], keywords: string[], limit: number, skip: number) : Promise<Reliable<Array<News>>>;

    getKeywordsByLocationCode(locationCodes: string[]): Promise<Reliable<string[]>>;
}