import { Reliable, Type } from "@core/repository/base/Reliable";
import { AliDbClient } from "@dbs/AliDbClient";
import { GetLocationData } from "./GetLocationsData";

/**
 * Lấy toàn bộ keyword, cung cấp danh sách location 
 */
export class GetKeywordsData {
    async invoke(locationCodes: string[] = []): Promise<Reliable<string[]>> {
        /** chúng ta sẽ sử dụng toàn bộ location trên db nếu location không được cung cấp sẵn trong tham số */

        /** lấy mảng location object */
        const locationDataReliable = await new GetLocationData().invoke(locationCodes);
        if (locationDataReliable.type == Type.FAILED || !locationDataReliable.data) {
            return locationDataReliable;
        }
        const locations = locationDataReliable.data!!;

        const keywords: string[] = [];
        /* lấy tất cả keyword từ mỗi location, xóa bỏ trùng lặp */
        for (var i = 0; i < locations.length; i++) {
            const location = locations[i];
            if (location && location.keywords && Array.isArray(location.keywords)) {
                const kws: any[] = Array.from(location.keywords) || [];
                kws.forEach(kw => {
                    if (typeof (kw) === 'string' && !keywords.includes(kw)) {
                        keywords.push(kw);
                    }
                })
            }
        }

        return Reliable.Success(keywords);
    }
}