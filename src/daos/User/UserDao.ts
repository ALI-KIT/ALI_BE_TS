import { IDao } from '@daos/IDao';
import { User, UserSchema } from '@entities/User';

class UserDao extends IDao<User> {

    constructor() {
        super('user', UserSchema);
    }
}

export default UserDao;
