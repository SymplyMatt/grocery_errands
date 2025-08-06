import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user: string; 
  email: string;
  phone: string;
  username: string | null;
  role: string;
  apiToken: string;
  apiKey: string;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
  if (!token) {
    return res.status(401).json({ error: 'Authentication token is missing' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = (decoded as any).user;
    req.email = (decoded as any).email;
    req.phone = (decoded as any).phone;
    req.username = (decoded as any).username || null;
    req.role = (decoded as any).role;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export default authenticateToken;
