import { Reliable } from './Reliable';
import { injectable } from 'inversify';

export interface NewsRepository {
    talk(words: string) : Promise<Reliable<string>>;
    do() : Promise<Reliable<boolean>>;
}