import { IDao } from '@daos/IDao';
import { IUser, UserSchema } from '@entities/User';

class UserDao extends IDao<IUser> {

    constructor() {
        super('user', UserSchema);
    }
}

export default UserDao;
