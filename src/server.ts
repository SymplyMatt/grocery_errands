import express, { Application } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import './environment';
import handleErrors from './middleware/handleErrors';
import validateEnv from './config/validateEnv';
import rateLimiter from './config/rateLimiter';
import timeout from 'connect-timeout'; 
import cookieParser from 'cookie-parser';
import router from './routes/router';
import connectDB from './config/mongodb';
import { decryptApiKey } from './middleware/decryptAndCheckKey';
import { authenticateApiKey } from './middleware/authenticateApiKey';

dotenv.config();
validateEnv();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const timeoutDuration = '1m'; 

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true
}));

app.use(timeout(timeoutDuration));
app.use((req, res, next) => {
    if (!req.timedout) next(); 
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
// app.use(rateLimiter);
app.set('x-powered-by', false);
app.use(cookieParser());

// app.use('/', decryptApiKey, authenticateApiKey, router);
app.use('/', router);
app.use(handleErrors);

connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));