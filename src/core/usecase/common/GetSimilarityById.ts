import { Reliable } from "@core/repository/base/Reliable";
import { MongoDbBackendClient } from "@daos/MongoDbBackendClient";
import MongoDb from "mongodb";

export class getSimilarityById {
    public constructor(private id: string) { }
    public async invoke(): Promise<Reliable<any>> {
        const collection = (await MongoDbBackendClient.waitInstance()).useALIDB().collection("analyzer-similarity");
        let similarity: any;
        const id = this.id;
        try {
            similarity = await collection.findOne({ _id: new MongoDb.ObjectId(id) })

        } catch (e) {
            return Reliable.Failed("Couldnot get the similarity", e);
        }

        if (!similarity) {
            return Reliable.Failed("Couldnot get the simiarity");
        }

        similarity.sessionCode = undefined;
        similarity.id = similarity._id;
        similarity._id = undefined;
        if (similarity.data && Array.isArray(similarity.data)) {
            const arr: any[] = similarity.data;
        }
        return Reliable.Success(similarity);

    }
}