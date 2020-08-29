import { AliDb } from './AliDb';

/**
 * Giữ kết nối tới mọi Collection nằm trong một MongoDb Dbs Connection
 */
export class AliDbClient {
    private static BASE_CONNECTION_1 = "mongodb+srv://user1:123455@ali-db.gyx2c.gcp.mongodb.net/"

    //TODO: Thêm các biến db collection 
    public localDbs = new AliDb("locals");
    public aliDbs = new AliDb("ALI-DB");
    
    public async connect() : Promise<void> {
        //TODO: Init các collection
        await this.localDbs.init(AliDbClient.BASE_CONNECTION_1);
        await this.aliDbs.init(AliDbClient.BASE_CONNECTION_1);
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

}