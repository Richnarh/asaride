import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpStatus } from '../utils/constants.js';
import { AppError } from '../utils/errors.js';

interface AuthRequest extends Request {
  user?: { userId: string };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    const decoded = jwt.verify(token,  process.env.JWT_SECRET) as { userId: string };
    req.user = { userId: decoded.userId };
    next();
  } catch (error:any) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Access token has expired', HttpStatus.UNAUTHORIZED)
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid access token', HttpStatus.FORBIDDEN)
    }
    throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR)
  }
}