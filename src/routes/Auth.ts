import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK, UNAUTHORIZED } from 'http-status-codes';

import { JwtService } from '@shared/JwtService';
import { paramMissingError, loginFailedErr, cookieProps } from '@shared/constants';
import passport from 'passport';
import AppDatabase from '@daos/AppDatabase';
import { User } from '@entities/User';
import { Type } from '@core/repository/base/Reliable';


const router = Router();
const userDao = AppDatabase.getInstance().UserDao;
const jwtService = new JwtService();


require("@passport")(passport);

/******************************************************************************
 *                      Login User - "POST /api/auth/login"
 ******************************************************************************/

router.post('/login', async (request, response) => {
  const email = request.body.email || '';
  const password = request.body.password || '';
  if (email && password) {
    const user = await userDao.findOne({ email: email });
    if (!user) {
      response.status(UNAUTHORIZED).send({
        success: false,
        message: "email is doesn't exist",
      });
    } else {
      user.comparePassword(password, (error, isMatch) => {
        if (isMatch && !error) {
          const token = user.generateToken();

          response
            .status(OK)
            .send({
              success: true,
              user: user,
              token: `${process.env.JWT_TOKEN_PREFIX} ${token}`,
            });
        } else {
          response
            .status(UNAUTHORIZED)
            .send({
              success: false,
              message: "password is not match",
            });
        }
      });
    }
  }
});


const getUser = (request: Request): User | null => {
  if (request) {
    var data = request.body as User;
    if (data.email && data.username && data.password && data.name) {
      return data;
    }
  }
  return null;
};

router.post('/register', async (req: Request, res: Response) => {

  const data = getUser(req);
  console.log("hello");
  console.log("data");
  let message = "";
  if (data != null) {
    const findUser = await userDao.findOne({ email: data.email });
    if (findUser == null) {
      const reliable = await userDao.create(data);
      let result = reliable.data;
      if (result && reliable.type == Type.SUCCESS) {
        res.status(OK).send({
          success: true,
          message: "success!!",
          user: result,
          token: (result as User).generateToken()
        });
      }
    }
    else {
      message = "email is exist";

    }
  } else {
    message = "data invalid";
  }
  res.status(BAD_REQUEST).send({
    success: false,
    message: message
  });
})

/******************************************************************************
 *                      Logout - "GET /api/auth/logout"
 ******************************************************************************/

router.get('/logout', async (req: Request, res: Response) => {
  const { key, options } = cookieProps;
  res.clearCookie(key, options);
  return res.status(OK).end();
});


/******************************************************************************
 *                                 Export Router
 ******************************************************************************/

export default router;
