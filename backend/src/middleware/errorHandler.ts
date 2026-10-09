import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse } from '../models/types';

export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode = 500,
    public isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const code    = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message   : 'Internal server error';

  if (code >= 500) {
    logger.error('Server error', { message: err.message, stack: err.stack, path: req.path });
  } else {
    logger.warn('Client error', { message: err.message, path: req.path, code });
  }

  const body: ApiResponse = { success: false, message };
  if (process.env['NODE_ENV'] !== 'production' && code >= 500) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (body as any)['stack'] = err.stack;
  }

  res.status(code).json(body);
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
  } as ApiResponse);
};
