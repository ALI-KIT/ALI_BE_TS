import { Reliable } from "@core/repository/base/Reliable";
import { AliDbClient } from "@dbs/AliDbClient";
import { GetLocationData } from "./GetLocationsData";

export class SetLocationData {
    async invoke(locations: any[]): Promise<Reliable<any[]>> {
        const collection = AliDbClient.getInstance().useServerConfig().collection("server-location-data");

        for (let i = 0; i < locations.length; i++) {
            const location = locations[i];
            if (location.code) {
                await collection.updateMany({ code: location.code }, { $set: location }, { upsert: true });
            }
        }
        return await new GetLocationData().invoke();
    }
}