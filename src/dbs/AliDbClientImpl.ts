import { AliDb } from './AliDb';

export abstract class BaseAliClient {
    public abstract async initDbs(baseUri: string): Promise<void>;
    
    public initted: boolean = false;
    public baseUri: string;

    protected constructor(baseUri: string) {
        if (baseUri != "" && baseUri[baseUri.length - 1] != '/') {
            baseUri += '/';
        }

        this.baseUri = baseUri;
    }
}

export class AliDbClientImpl extends BaseAliClient {

    public readonly locationsDb = new AliDb("locals");

    public constructor() {
        super('mongodb+srv://user1:123455@ali-db.gyx2c.gcp.mongodb.net/');
    }

    public async initDbs(baseUri: string): Promise<void> {
        // init all db
        await this.locationsDb.init(baseUri);
    
    }

} 