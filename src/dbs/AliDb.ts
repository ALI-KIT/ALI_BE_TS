import MongoClient from 'mongodb';

export class AliDb {
    public db?: MongoClient.Db;
    private _dbName: string = "";
    private _uri: string = "";

    public constructor(dbName: string) {
        this._dbName = dbName;
    }

    public async init(baseUri: string): Promise<void> {
        if (baseUri != "" && baseUri[baseUri.length - 1] != '/') {
            baseUri += '/';
        }
        this._uri = baseUri + this._dbName;
        await AliDb.connect(this._uri);
    }

    public static async connect(url: string): Promise<MongoClient.Db> {
        return await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(client => client.db())
    }
}