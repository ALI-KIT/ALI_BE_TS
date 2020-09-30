import MongoClient from 'mongodb';

/**
 * Giữ kết nối tới mọi Collection nằm trong một MongoDb Dbs Connection
 */
export class AliDbClient {
    private static BASE_CONNECTION_1 = "mongodb+srv://user1:123455@ali-db.gyx2c.gcp.mongodb.net/";

    //TODO: Thêm các biến db collection 
    public locals?: MongoClient.MongoClient;
    public ali?: MongoClient.MongoClient;
    
    private async connect() : Promise<void> {
        //TODO: Init các collection
        this.locals = await this.mongoClientConnect(AliDbClient.BASE_CONNECTION_1+"locals");
        this.ali = await this.mongoClientConnect(AliDbClient.BASE_CONNECTION_1+"ALI-DB")

    }

    private async disconnect() : Promise<void> {
        await this.mongoClientDisconnect(this.locals);
        await this.mongoClientDisconnect(this.ali);
    }

    private async mongoClientDisconnect(mongoClient?: MongoClient.MongoClient) {
        if(mongoClient)
        return await mongoClient?.close(true);
    }

    private async mongoClientConnect(url: string): Promise<MongoClient.MongoClient> {
        return await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    private static instance = new AliDbClient();

    private AliDbClient() {}  

    public static getInstance() : AliDbClient {
        if(!AliDbClient.instance.isConnected) {
            throw "AliDbClient is n't connected yet!"
        }
        return AliDbClient.instance;
    }

    private isConnected: boolean = false;
    public static async connect(): Promise<void> {
        if(!AliDbClient.instance.isConnected) {
            await AliDbClient.instance.connect();
            AliDbClient.instance.isConnected = true;
        }
    }

    public static async disconnect(): Promise<void> {
        if(AliDbClient.instance.isConnected) {
           return await AliDbClient.instance.disconnect();
        }
    }

}