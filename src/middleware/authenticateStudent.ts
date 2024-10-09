import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authenticateToken';

const authenticateStudent = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user_role = req.role || '';
  try {
      if (user_role !== 'student') {
        return res.sendStatus(401);
      }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export default authenticateStudent;
