// types/express.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: string; 
      email?: string;
      phone?: string;
      username?: string | null;
      role?: string;
      apiToken?: string;
      apiKey?: string;
    }
  }
}