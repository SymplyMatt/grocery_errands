import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    email?: string;
    id?: string;
    role?: string;
  }
}
