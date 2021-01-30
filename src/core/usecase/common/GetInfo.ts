import { Reliable } from "@core/repository/base/Reliable";
import { MongoDbBackendClient } from "@daos/MongoDbBackendClient";
import { AppProcessEnvironment } from "@loadenv";

export class GetInfo {
    async invoke(): Promise<Reliable<any>> {
        const configDb = MongoDbBackendClient.getInstance().useServerConfig();
        try {
            const serverState = await configDb.collection("server-state").findOne({ name: "server-common-state" });
            serverState._id = undefined;
            serverState.name = undefined;
            serverState.version = AppProcessEnvironment.getProcessEnv().ENV_VERSION_CODE;
            return Reliable.Success(serverState);
        } catch (e) {
            return Reliable.Failed(e.message || "", e);
        }
    }
}