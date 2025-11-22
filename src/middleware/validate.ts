import { Response, Request, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export default function validate(
    req: Request,
    res: Response<any, Record<string, any>>,
    next: NextFunction,
  ) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ error: errors.array()[0].msg });
        }
  
    next();
}