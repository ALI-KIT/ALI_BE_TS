"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const tslib_1 = require("tslib");
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const User_1 = require("@entities/User");
const UserDao_mock_1 = tslib_1.__importDefault(require("@daos/User/UserDao.mock"));
const constants_1 = require("@shared/constants");
const creds = {
    email: 'jsmith@gmail.com',
    password: 'Password@1',
};
exports.login = (beforeAgent, done) => {
    const role = User_1.UserRoles.Admin;
    const pwdHash = bcrypt_1.default.hashSync(creds.password, constants_1.pwdSaltRounds);
    const loginUser = new User_1.User('john smith', creds.email, role, pwdHash);
    spyOn(UserDao_mock_1.default.prototype, 'getOne').and.returnValue(Promise.resolve(loginUser));
    beforeAgent
        .post('/api/auth/login')
        .type('form')
        .send(creds)
        .end((err, res) => {
        if (err) {
            throw err;
        }
        done(res.headers['set-cookie']);
    });
};
//# sourceMappingURL=LoginAgent.js.map