import { Dao } from '@daos/Dao';
import { User, UserSchema } from '@entities/User';
import { Connection } from 'mongoose';

class UserDao extends Dao<User> {

    constructor() {
        super('user', UserSchema);
    }
}

export default UserDao;
