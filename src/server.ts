import express, { Application } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import './environment';
import handleErrors from './middleware/handleErrors';
import validateEnv from './config/validateEnv';
import rateLimiter from './config/rateLimiter';
import timeout from 'connect-timeout'; 
import cookieParser from 'cookie-parser';
import prisma from './config/prisma';
import router from './routes/router';
dotenv.config();
validateEnv();

const app: Application = express();
const PORT = process.env.PORT || 3000;

const timeoutDuration = '1m'; 
app.use(timeout(timeoutDuration));
app.use((req, res, next) => {
    if (!req.timedout) next(); 
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(rateLimiter);
app.set('x-powered-by', false);
app.use(cookieParser());

app.use('/', router);
app.use(handleErrors);
// (async()=>{
//     await prisma.$connect()
//     console.log("Database connected successfully");
// })();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));