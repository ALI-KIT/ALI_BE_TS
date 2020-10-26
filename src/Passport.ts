import {Strategy,ExtractJwt} from 'passport-jwt';    
// load up the user model
import passport from 'passport';
import AppDatabase from '@daos/AppDatabase';

const User = AppDatabase.getInstance().UserDao;
module.exports = function() {
  var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: process.env.JWT_SECRET || 'JWTSECRET'
  };
  
  passport.use(new Strategy(opts, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.id}, function(err, user) {
          if (err) {
              return done(err, false);
          }
          if (user) {
              done(null, user);
          } else {
              done(null, false);
          }
      });
  }));
};
