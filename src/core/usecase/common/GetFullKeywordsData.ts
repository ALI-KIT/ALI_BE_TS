import { Reliable, Type } from "@core/repository/base/Reliable";
import { GetLocationData } from "./GetLocationsData";

export class GetFullKeywordsData {
    async invoke(): Promise<Reliable<{
        initial_keywords: string[],
        related_keywords: string[],
        related_disabled_keywords: string[],
        added_keywords: string[],
        keywords: string[]
    }>> {
        const data = {
            initial_keywords: [] as string[],
            related_keywords: [] as string[],
            related_disabled_keywords: [] as string[],
            added_keywords: [] as string[],
            keywords: [] as string[]
        };

        const reliable = await new GetLocationData().invoke();
        if (reliable.type == Type.FAILED || !reliable.data) {
            return Reliable.Failed(reliable.message, reliable.error);
        }

        const locations = reliable.data;
        locations.forEach(location => {
            const iks: string[] = location.initial_keywords || [];
            iks.forEach(k => {
                if (!data.initial_keywords.includes(k)) {
                    data.initial_keywords.push(k);
                }
            })

            const rks: string[] = location.related_keywords || [];
            rks.forEach(k => {
                if (!data.related_keywords.includes(k)) {
                    data.related_keywords.push(k);
                }
            });

            
            const rdks: string[] = location.related_disabled_keywords || [];
            rdks.forEach(k => {
                if (!data.related_disabled_keywords.includes(k)) {
                    data.related_disabled_keywords.push(k);
                }
            });

            const ks: string[] = location.keywords || [];
            ks.forEach(k => {
                if (!data.keywords.includes(k)) {
                    data.keywords.push(k);
                }
            });


        });

        return Reliable.Success(data);
    }
}