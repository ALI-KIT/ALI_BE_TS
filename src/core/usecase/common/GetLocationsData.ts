import { Reliable } from "@core/repository/base/Reliable";
import { MongoDbBackendClient } from "@daos/MongoDbBackendClient";

/**
 * Lấy toàn bộ location 
 */
export class GetLocationData {
    async invoke(locationCodes: string[] = []): Promise<Reliable<any[]>> {
        /** chúng ta sẽ sử dụng toàn bộ location trên db nếu location không được cung cấp sẵn trong tham số */

        /** lấy mảng location object */
        let locations : string[]= [];
        try {
            const collection = (await MongoDbBackendClient.waitInstance()).useServerConfig().collection("server-location-data");

            if (locationCodes.length != 0) {
                /* find in list */
                locations = await collection.find({ code: { $in: [] } }).toArray();
            } else {
                /* find all */
                locations = await collection.find({}).toArray();
            }
            if (locations == null) {
                locations = [];
            }
        } catch (e) {
            locations = [];
        };


        return Reliable.Success(locations);
    }
}