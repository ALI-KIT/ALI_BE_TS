import { Document, Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs';
import passportLocalMongoose from 'passport-local-mongoose';

export enum UserRoles {
  Standard,
  Admin,
}

export interface IUser extends Document {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRoles;
  createdDate: Date;
}

export const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true, // required
    trim: true,
  },
  email: {
    type: String,
    required: true, // required
    unique: true, // unique email
    trim: true,
  },
  username: {
    type: String,
    unique: true, // unique username
    required: true, // required
    trim: true,
  },
  password: {
    type: String,
    required: true, // required
  },
  role: {
    type: UserRoles,
    default: UserRoles.Standard
  },
  createdDate: {
    type: Date,
    default: Date.now
  }

})

UserSchema.pre('save', function (next) {
  const user = this as any;

  // only hash the password if it has been modified (or is new)
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (error, salt) {
      // handle error
      if (error) return next(error);

      // hash the password using our new salt
      bcrypt.hash(user.password, salt, function (error, hash) {
        // handle error
        if (error) return next(error);

        // override the cleartext password with the hashed one
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

// post saving user
UserSchema.post('save', function (user, next) {
  next();
});

// compare password
UserSchema.methods.comparePassword = function (passw: any, cb: any) {
  bcrypt.compare(passw, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

// pass passport-local-mongoose plugin
// in order to handle password hashing
UserSchema.plugin(passportLocalMongoose);