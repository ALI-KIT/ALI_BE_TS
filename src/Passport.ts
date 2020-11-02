import { Strategy, ExtractJwt } from 'passport-jwt';
// load up the user model
import AppDatabase from '@daos/AppDatabase';

const User = AppDatabase.getInstance().UserDao;
// module.exports = function () {
//   var opts = {
//     jwtFromRequest: ExtractJwt.fromAuthHeader(),
//     secretOrKey: process.env.JWT_SECRET || 'JWTSECRET'
//   };

//   passport.use(new Strategy(opts, async (jwt_payload, done) => {
//     const email = jwt_payload.email;
//     var rs = await User.findOne({ email: email });
//     done(null, (rs == null) ? null : rs);
//   }));
// };

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(process.env.JWT_SCHEME||""),
  secretOrKey: process.env.JWT_SECRET_OR_KEY
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