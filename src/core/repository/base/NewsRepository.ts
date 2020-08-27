import { Reliable } from './Reliable';
import { injectable } from 'inversify';
import { News } from '@entities/News2';

export interface NewsRepository {
    talk(words: string) : Promise<Reliable<string>>;
    do() : Promise<Reliable<boolean>>;

    getNewsFeed(locationCodes: string[], keywords: string[], limit: number, skip: number) : Promise<Reliable<Array<News>>>;
}