import { Request, Response, NextFunction } from 'express';
import { UnauthenticatedError } from '../errors/customErrors.js';
import { verifyToken } from '../utils/jwtUtils.js';
import { IRequest } from '../types/index.js';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    (req as IRequest).user = decoded;
    next();
  } catch (error) {
    throw new UnauthenticatedError('Invalid token');
  }
}; 