import { Reliable } from "@core/repository/base/Reliable";
import AppDatabase from "@daos/AppDatabase";
import { DbScript } from "@scripts/DbScript";

export class LimitDocument extends DbScript<any> {
    public static readonly MAX = 47000;
    protected async runInternal(): Promise<Reliable<any>> {
        const count = await AppDatabase.getInstance().news2Dao.model.countDocuments();
        var after = count;
        if (count > LimitDocument.MAX) {
            const deleted = count - LimitDocument.MAX;

            const ids = (await AppDatabase.getInstance()
                .news2Dao
                .model
                .find({})
                .sort({ publicationDate: 1 })).map(doc => doc._id);

            const result = await AppDatabase.getInstance().news2Dao.model.remove({ _id: { $in: ids } })
            return Reliable.Success(result);
        }

        return Reliable.Success("LimitDocument: Count = " + count + " < " + LimitDocument.MAX);
    }

}