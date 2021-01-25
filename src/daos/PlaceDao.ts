import { Place, PlaceSchema } from '@entities/Place'
import { Dao } from '@daos/Dao';
import { Connection } from 'mongoose';

export class PlaceDao extends Dao<Place> {
    constructor() {
        super('place', PlaceSchema);
    }
}