import { Strategy, ExtractJwt } from 'passport-jwt';
// load up the user model
import AppDatabase from '@daos/AppDatabase';
import { AppProcessEnvironment } from '@loadenv';

const User = AppDatabase.getInstance().userDao;
// module.exports = function () {
//   var opts = {
//     jwtFromRequest: ExtractJwt.fromAuthHeader(),
//     secretOrKey: EnvironmentConstant.getProcessEnv().JWT_SECRET || 'JWTSECRET'
//   };

//   passport.use(new Strategy(opts, async (jwt_payload, done) => {
//     const email = jwt_payload.email;
//     var rs = await User.findOne({ email: email });
//     done(null, (rs == null) ? null : rs);
//   }));
// };

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(AppProcessEnvironment.getProcessEnv().JWT_SCHEME||""),
  secretOrKey: AppProcessEnvironment.getProcessEnv().JWT_SECRET_OR_KEY
};
const passportJWTStrategy = new Strategy(opts, async (jwtPayload, done) => {
  // retrieve mail from jwt payload
  const email = jwtPayload.email;
  var rs = await User.findOne({ email: email });
  done(null, (rs == null) ? null : rs);
});

module.exports = function(passport: any) {
  passport.use(passportJWTStrategy);
  return passport;
};