import { Place, PlaceSchema } from '@entities/Place'
import { IDao } from '@daos/IDao';

export class PlaceDao extends IDao<Place> {
    constructor() {
        super('place', PlaceSchema);
    }
}