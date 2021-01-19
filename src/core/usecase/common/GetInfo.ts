import { Reliable } from "@core/repository/base/Reliable";
import { AliDbClient } from "@dbs/AliDbClient";

export class GetInfo {
    async invoke(): Promise<Reliable<any>> {
        const configDb = AliDbClient.getInstance().useServerConfig();
        try {
            const serverState = await configDb.collection("server-state").findOne({ name: "server-common-state" });
            serverState._id = undefined;
            serverState.name = undefined;
            return Reliable.Success(serverState);
        } catch (e) {
            return Reliable.Failed(e.message || "", e);
        }
    }
}