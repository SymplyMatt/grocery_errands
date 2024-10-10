import express, { Application } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import './environment';
import cors from 'cors';
import morgan from 'morgan';
import credentials from './middleware/credentials';
import handleErrors from './middleware/handleErrors';
import router from './routes/router';
import validateEnv from './config/validateEnv';
import corsOptions from './config/corsOptions';
import rateLimiter from './config/rateLimiter';
import cookieParser from 'cookie-parser';
import { sequelize } from './config/database';  
import { defineAssociations } from './models/associations';
import timeout from 'connect-timeout'; 

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
app.use(credentials);
app.use(rateLimiter);
app.use(cors(corsOptions));
app.set('x-powered-by', false);
app.use(cookieParser());

app.use('/', router);

app.use(handleErrors);

defineAssociations(); 

sequelize.sync({ force: false })  
    .then(() => {
        console.log('Database connected and models synchronized.');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error('Error connecting to the database:', err)
);
