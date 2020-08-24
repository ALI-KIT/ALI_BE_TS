import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors'

import express, { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import 'express-async-errors';

import BaseRouter from '@routes/Api';
import logger from '@shared/Logger';
import { cookieProps } from '@shared/constants';

import "reflect-metadata";
import { Container } from 'inversify';
import container from '@core/di/InversifyConfigModule'
import { interfaces, InversifyExpressServer, TYPE } from 'inversify-express-utils';

import '@controller/impl/NewsController';

import '@mongodb'



// Init express
const expressApp = express();
const server = new InversifyExpressServer(container, null,  {rootPath: '/api/v2'}, expressApp);
const app = server.build();

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(cookieProps.secret));

const allowedOrigins = ['http://54.169.227.141:3000', "http://localhost:3000", "http://localhost:5000"];

//options for cors midddleware
const options: cors.CorsOptions = {
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'X-Access-Token',
    ],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: function (origin, callback) {
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    preflightContinue: false,
};

//use cors middleware
app.use(cors(options));

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

// Add APIs
app.use('/api', BaseRouter);

//enable pre-flight
app.options('*', cors(options));

// Print API errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
        error: err.message,
    });
});



/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

// const viewsDir = path.join(__dirname, 'views');
// app.set('views', viewsDir);
// const staticDir = path.join(__dirname, 'public');
// app.use(express.static(staticDir));

// app.get('/', (req: Request, res: Response) => {
//     res.sendFile('login.html', {root: viewsDir});
// });

// app.get('/users', (req: Request, res: Response) => {
//     const jwt = req.signedCookies[cookieProps.key];
//     if (!jwt) {
//         res.redirect('/');
//     } else {
//         res.sendFile('users.html', {root: viewsDir});
//     }
// });


// Export express instance
export default app;
