import { Reliable } from "@core/repository/base/Reliable";
import { AliDbClient } from "@dbs/AliDbClient";
import { injectable } from "inversify";

/**
 * Lấy toàn bộ location 
 */
@injectable()
export class GetLocationData {
    async invoke(locationCodes: string[] = []): Promise<Reliable<any[]>> {
        /** chúng ta sẽ sử dụng toàn bộ location trên db nếu location không được cung cấp sẵn trong tham số */

        /** lấy mảng location object */
        let locations : string[]= [];
        try {
            const collection = AliDbClient.getInstance().useServerConfig().collection("server-location-data");

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