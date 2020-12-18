import { Place, PlaceSchema } from '@entities/Place'
import { Dao } from '@daos/Dao';

export class PlaceDao extends Dao<Place> {
    constructor() {
        super('place', PlaceSchema);
    }
}