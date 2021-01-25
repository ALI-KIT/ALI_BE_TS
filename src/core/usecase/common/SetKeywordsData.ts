import { Reliable, Type } from "@core/repository/base/Reliable";
import { GetKeywordsData } from "./GetKeywordsData";
import { GetLocationData } from "./GetLocationsData";
import { SetLocationData } from "./SetLocationsData";

/**
 * Cập nhật danh sách từ khóa:
 * - initial_keywords: không thể cập nhật
 * - related_keywords: có thể disable
 * - added_keywords: có thể thêm và xóa
 */
export class SetKeywordsData {
    /**
     * Tải lên mảng keywords mới
     * @param newKeywords mảng keywords mới
     */
    async invoke(newKeywords: string[] = []): Promise<Reliable<any>> {
        /**
         * Nếu related không năm trong list => bị disabled
         * list - (initial + related) == added mới
         */
        const locationsReliable = await new GetLocationData().invoke();
        if (locationsReliable.type == Type.FAILED || !locationsReliable.data) {
            return locationsReliable;
        }
        const locations = locationsReliable.data;
        const builtInKeywords: string[] = [];

        /* update the new related disabled keywords */
        for (let i = 0; i < locations.length; i++) {
            const location = locations[i];
            const related_keywords: string[] = location.related_keywords || [];
            const initial_keywords: string[] = location.initial_keywords || [];
            location.initial_keywords = initial_keywords;

            // find disabled keywords 
            const related_disabled_keywords: string[] = [];
            related_keywords.forEach(kw => {
                // add to disabled list if a related keyword wasn't included 
                // in new keywords list
                if (!newKeywords.includes(kw)) {
                    related_disabled_keywords.push(kw);
                }

                // temp add to a list for finding the added keywords
                if (!builtInKeywords.includes(kw)) {
                    builtInKeywords.push(kw);
                }
            });
            location.related_disabled_keywords = related_disabled_keywords;

            initial_keywords.forEach(kw => {
                if (!builtInKeywords.includes(kw)) {
                    builtInKeywords.push(kw);
                }
            });
        }

        /* find out added_keywords */
        /* added_keywords == includes in newKeywords but not includes in builtInKeywords */
        const added_keywords: string[] = [];
        newKeywords.forEach(kw => {
            if (!builtInKeywords.includes(kw)) {
                added_keywords.push(kw)
            }
        });


        /** let update added_keywords and keywords */
        for (let i = 0; i < locations.length; i++) {
            const location = locations[i];
            const initial_keywords: string[] = location.initial_keywords || [];
            const related_keywords: string[] = location.related_keywords || [];
            const related_disabled_keywords: string[] = location.related_disabled_keywords || [];

            const keywords: string[] = [...added_keywords];

            initial_keywords.forEach(kw => {
                if (!keywords.includes(kw)) {
                    keywords.push(kw);
                }
            });

            related_keywords.forEach(kw => {
                if ((!related_disabled_keywords.includes(kw)) && !keywords.includes(kw)) {
                    keywords.push(kw);
                }
            });

            location.added_keywords = [...added_keywords];
            location.keywords = keywords;
        }

        return new SetLocationData().invoke(locations);
    }
}