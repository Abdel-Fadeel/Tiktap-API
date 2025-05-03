import { Request, Response, NextFunction } from 'express';
import { IResponse } from '../types/index.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return (res as IResponse).status(400).json({
      status: false,
      message: 'Validation Error',
      errors: Object.values(err).map((error: any) => error.message),
    });
  }

  if (err.name === 'UnauthorizedError') {
    return (res as IResponse).status(401).json({
      status: false,
      message: 'Unauthorized',
    });
  }

  return (res as IResponse).status(500).json({
    status: false,
    message: 'Internal Server Error',
  });
}; 