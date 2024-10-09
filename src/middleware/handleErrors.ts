import { Application, Request, Response, NextFunction } from 'express';

const handleErrors = (err: Error, req : Request, res : Response, next : NextFunction) => {
    console.error(err.stack);
    res.status(501).send('Something broke!');
};

export default handleErrors;
