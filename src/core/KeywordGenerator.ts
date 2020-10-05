import { Reliable } from './repository/base/Reliable';

/**
 * generate một mảng string keyword từ location cho sẵn
 */
export class KeywordGenerator {
    public async run(): Promise<Reliable<string[]>> {
        const data: string[] = [];
        
        return Reliable.Success(data);
    }
}