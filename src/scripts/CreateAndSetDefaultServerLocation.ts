import { Reliable, Type } from '@core/repository/base/Reliable';
import '@loadenv';
import { EnvironmentConstant } from '@loadenv';
import MongoClient from 'mongodb';

/**
 * - Tạo 1 location config data
 * - Set default location của server là location đó
 */
export class CreateAndSetDefaultServerLocation {
    private connectionString = EnvironmentConstant.CONFIG_DB_URI;
    private dbString = "SERVER-CONFIG";

    public async run() : Promise<Reliable<any>> {
        const client = await this.mongoClientConnect(this.connectionString);
        const localCode = "763";
        const createReliable = await this.createLocationData(localCode, client);
        if(createReliable.type == Type.SUCCESS) {
            await this.setDefaultLocationToCurrentServerConfig(localCode, client);
        }
        return createReliable;
    }

    isPositiveNumber(value: string) {
        return /^-?\d+$/.test(value);
    }

    public async createLocationData(localCode: string, client: MongoClient.MongoClient) : Promise<Reliable<any>> {
        const serverConfigString = this.dbString;
        const aliDbString = "ALI-DB";
        const overriden = true;

        const serverConfigDb = client.db(serverConfigString);

        // Hãy thêm một location là quận 9

        /**
         * Mot item location data: 
         {
             _id: auto-generated,
             code: "79", // unique,
             name: "quan-9", // tên ngắn gọn
             keywords: [], // keywords dùng để chạy feeds tin tức 
             initial_keywords: [] // keywords mặc định, các keywords khác là được quản trị viên thêm vào
             type: "quan-huyen", "phuong-xa", "tinh-thanh"
             ...
         }
         */
        // Kiểm tra xem quan 9 đã tồn tại chưa
        const code = localCode;
        const serverLocationDataCollection = serverConfigDb.collection("server-location-data");
        var quan9 = await serverLocationDataCollection.findOne({code: code});

        if(quan9) {
            if(!overriden)
            return Reliable.Success(quan9);
            else await serverLocationDataCollection.deleteOne({code: code});
        }
        // now we get quan-9 from general location db
        const aliLocationCollection = client.db(aliDbString).collection("ali-location");
        quan9 = await aliLocationCollection.findOne({code: code});
        if(!quan9) {
            return Reliable.Failed("The code provided is invalid");
        }

        if(!quan9.keywords) {
            quan9.keywords = [];
        }

        quan9.initial_keywords = [...quan9.keywords];
        
        const childCodes: string[] = [];
        await this.findAllChildLocationReferences(childCodes, localCode, aliLocationCollection);

        const childs: string[] = [];
        for(var i = 0; i < childCodes.length;i++) {
            const item = await aliLocationCollection.findOne({code: childCodes[i]});
            if(item) {
                /* if the field "name" is not a number */
                if(item.name && !this.isPositiveNumber(item.name)) {
                    childs.push(item.name);
                } else if(item.name_with_type) {
                    childs.push(item.name_with_type);
                }
            }
        }

        quan9.keywords = [...quan9.keywords, ...childs];

        await serverLocationDataCollection.insertOne(quan9);
        return Reliable.Success(quan9);
    }

    private async findAllChildLocationReferences(result: string[], localCode: string, collecton: MongoClient.Collection<any>) {
        // find all items having parent_code equals localCode
        // add to result
        const list = await collecton.find({parent_code: localCode}).toArray();
        if(list) {
            list.forEach(doc => {
                const code:string = doc.code;
                if(code && !result.includes(code)) {
                    result.push(code);
                    this.findAllChildLocationReferences(result, code, collecton);
                }
            })
        }
    }

    public async setDefaultLocationToCurrentServerConfig(localCode: string, client: MongoClient.MongoClient) : Promise<Reliable<any>> {
        const serverConfigString = this.dbString;

        const serverConfigDb = client.db(serverConfigString);
        const serverStateCollection = serverConfigDb.collection("server-state");

        const locationItem = await await serverConfigDb.collection("server-location-data").findOne({code: localCode});
        const displayName = locationItem && locationItem.name_with_type ? locationItem.name_with_type : null;

        var serverCommonState = await serverStateCollection.findOne({name: "server-common-state"});
        if(!serverCommonState) {
            serverCommonState = {}
        }
        serverCommonState.locationCode = localCode;
        serverCommonState.locationDisplayName = displayName;
        await serverStateCollection.updateOne({name: "server-common-state"}, {$set: serverCommonState}, {upsert: true});
        
        return Reliable.Success(null);
    }

    private async mongoClientDisconnect(mongoClient?: MongoClient.MongoClient) {
        if(mongoClient)
        return await mongoClient?.close(true);
    }

    private async mongoClientConnect(url: string): Promise<MongoClient.MongoClient> {
        return await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    }
}

new CreateAndSetDefaultServerLocation().run().then((reliable) => {
    LogUtil.consoleLog("Task finished with below data: ");
    LogUtil.consoleLog(reliable)
}).catch(e => {
    LogUtil.consoleLog(e);
}).finally(() => {
    process.exit(0);

})
