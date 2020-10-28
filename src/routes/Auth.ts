import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK, UNAUTHORIZED } from 'http-status-codes';

import UserDao from '@daos/User/UserDao.mock';
import { JwtService } from '@shared/JwtService';
import { paramMissingError, loginFailedErr, cookieProps } from '@shared/constants';
import passport from 'passport';
import { authenticate } from 'passport';
import AppDatabase from '../daos/AppDatabase';


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
        const user = await userDao.findOne({email: email});
        if(!user){
            response.status(UNAUTHORIZED).send({
                success: false,
                message: "email is doesn't exist",
              });
          } else {
            // check if password matches
            user.comparePassword(password, (error, isMatch) => {
              if (isMatch && !error) {
                // if user is found and password is right create a token
                // algorithm: process.env.JWT_TOKEN_HASH_ALGO
                const token = jwt.sign(
                    user.toJSON(),
                    process.env.JWT_SECRET_OR_KEY||"JWT_SECRET_OR_KEY", {
                      expiresIn: process.env.JWT_TOKEN_EXPIRATION,
                    });
  
                // return the information including token as JSON
                response
                    .status(200)
                    .send({
                      success: true,
                      user: user,
                      token: `${process.env.JWT_TOKEN_PREFIX} ${token}`,
                    });
              } else {
                response
                    .status(401)
                    .send({
                      success: false,
                      message: "password is not match",
                    });
              }
            });
          }
        }
      });
    
  };


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
