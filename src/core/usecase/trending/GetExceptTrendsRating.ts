import { Reliable } from "@core/repository/base/Reliable";
import AppDatabase from "@daos/AppDatabase";
import { MongoDbBackendClient } from "@daos/MongoDbBackendClient";

export class GetExceptTrendsRating {
    public async invoke(): Promise<Reliable<string[]>> {
        try {
            const config = await (await MongoDbBackendClient.waitInstance()).useServerConfig().collection("trends-rating-config").findOne({ name: "config" });
            if (config && config.except && Array.isArray(config.except)) {
                const result: string[] = config.except || [];
                return Reliable.Success(result);
            } else {
                return Reliable.Success([]);
            }
        } catch (e) {
            return Reliable.Failed("Failed to get except trends rating", e);
        }
    }
}