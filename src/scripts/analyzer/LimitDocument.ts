import { Reliable } from "@core/repository/base/Reliable";
import AppDatabase from "@daos/AppDatabase";
import CrawlerDatabase from "@daos/CrawlerDatabase";
import { DbScript } from "@scripts/DbScript";
import { Model } from "mongoose";

abstract class LimitDocument extends DbScript<any> {

    public abstract getModel() : Promise<Model<any, {}>>;
    public MAX = 45000;
    public CYCLE_LIMIT = 1000;
    protected async runInternal(): Promise<Reliable<any>> {
        /* Lặp lại việc xóa document tới khi size của collection giảm về giới hạn cho phép */
        /* Check kỹ kết quả mỗi lần xóa document để tránh lặp vô hạn */
        /* Break vòng lặp ngay khi việc xóa thất bại, số document không giảm hoặc giảm tới mức nhỏ hơn giới hạn */
        const scriptName = this.constructor.name;
        const model = await this.getModel();

        if (!model) {
            return Reliable.Failed(scriptName + ": model is not found");
        }

        const FirstCount = await model.countDocuments();
        let count = FirstCount;

        /* Bỏ qua nếu trong giới hạn cho phép */
        if (count < this.MAX) {
            return Reliable.Success(scriptName + ": Count = " + FirstCount + " < " + this.MAX);
        }


        do {
            let NeedToDeleteCount = count - this.MAX;

            /* Xóa nhiều lần nhằm tránh việc Mongo tiêu tốn quá nhiều bộ nhớ trong một lần chạy */
            const cycleDeleted = NeedToDeleteCount > this.CYCLE_LIMIT ? this.CYCLE_LIMIT : NeedToDeleteCount;

            try {
                const ids : any[] = (await model.find({})
                        .limit(cycleDeleted)
                        .sort({ publicationDate: 1 })).map(doc => doc._id);

                const result = await model.deleteMany({_id: {$in: ids}});
                if ((!result.ok) || result.deletedCount <= 0) {
                    return Reliable.Failed(scriptName + ": failed to delete documents ");
                }

                var nextCount = await model.countDocuments();
                if (nextCount >= count) {
                    return Reliable.Failed(scriptName + ": document count didn't reduce after execution, so failed !");
                }

                count = nextCount;

            } catch (e) {
                return Reliable.Failed(scriptName + ": failed with an exception!", e);
            }
        } while (count > this.MAX);

        return Reliable.Success(scriptName + ": Before = " + FirstCount + ", After = " + count);

    }

}

export class LimitCrawlerDocument extends LimitDocument {
    public async getModel(): Promise<Model<any, {}>> {
        return (await CrawlerDatabase.waitInstance()).news2Dao.model;
    }

}

export class LimitBackendDocument extends LimitDocument {
    public async getModel(): Promise<Model<any, {}>> {
        return (await AppDatabase.waitInstance()).news2Dao.model;
    }
}