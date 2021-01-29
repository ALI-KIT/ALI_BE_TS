import { Reliable, Type } from "@core/repository/base/Reliable";
import { FindTrends } from "@core/usecase/trending/FindTrends";
import { TrendsRatingAnalyzer } from "@scripts/analyzer/trending/TrendsRatingAnalyzer";
import { DbScript } from "@scripts/DbScript";

export class TestTrendingByKeywords extends DbScript<any> {
    protected async runInternal(): Promise<Reliable<any>> {
        const output = await new FindTrends().invoke();
        return output;
    }

}

DbScript.exec(new TrendsRatingAnalyzer());