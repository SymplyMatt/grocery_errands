import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: Types.ObjectId;
      email?: string;
      phone?: string;
      username?: string | null;
      role?: string;
    }
  }
}

export {};