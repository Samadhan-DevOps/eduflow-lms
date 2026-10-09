import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';
import { AuthPayload } from '../models/types';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Please provide a valid Bearer token.', 401);
  }
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('Session expired. Please log in again.', 401);
    }
    throw new AppError('Invalid authentication token.', 401);
  }
};

export const authorizeRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new AppError('Authentication required.', 401);
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission for this action.', 403);
    }
    next();
  };
