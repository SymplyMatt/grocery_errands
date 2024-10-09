import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  email?: string;
  id?: string;
  role?: string;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

  if (!token) {
    return res.status(401).json({ error: 'Authentication token is missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.email = (decoded as any).email;
    req.id = (decoded as any).id;
    req.role = (decoded as any).role;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export default authenticateToken;
