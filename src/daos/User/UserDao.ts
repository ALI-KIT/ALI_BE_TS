import { Dao } from '@daos/Dao';
import { User, UserSchema } from '@entities/User';

class UserDao extends Dao<User> {

    constructor() {
        super('user', UserSchema);
    }
}

export default UserDao;
