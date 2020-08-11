import { Place, PlaceSchema } from '@entities/Place'
import { IDao } from '@daos/IDao';

export class PlaceDao extends IDao<Place> {
    constructor() {
        super('place', PlaceSchema);
    }


    async create(item: Place): Promise<Place | Error | null> {
        try {
            const data = await this.model.create(item);
            return data;
        }
        catch (error) {
            return error;
        }
    }
}