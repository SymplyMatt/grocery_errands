import allowedOrigins from "../config/allowedOrigins";
import express, { Application, Request, Response, NextFunction } from 'express';

const credentials = (req : Request, res : Response, next : NextFunction) => {
  const origin : string = req.headers.origin as string;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
};

export default credentials;
