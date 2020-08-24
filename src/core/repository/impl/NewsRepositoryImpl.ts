import { injectable, inject } from "inversify";
import "reflect-metadata";

import { NewsRepository } from '../base/NewsRepository';
import { Reliable } from '../base/Reliable';

@injectable()
export class NewsRepositoryImpl implements NewsRepository {
    
    async talk(words: string): Promise<Reliable<string>> {
        return Reliable.Success('Hi '+words+', I am human');
    }

    async do(): Promise<Reliable<boolean>> {
        const result = Reliable.Failed<string>("");

        throw new Error("Method not implemented.");
    }

}