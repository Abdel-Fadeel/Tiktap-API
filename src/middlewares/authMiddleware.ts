import {NextFunction, Request, Response} from 'express';
import {UnauthenticatedError} from '../errors/customErrors.js';
import {verifyToken} from '../utils/jwtUtils.js';
import {IRequest} from '../types/index.js';

export const authMiddleware = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    (req as IRequest).user = verifyToken(token);
    next();
  } catch (error) {
    throw new UnauthenticatedError('Invalid token');
  }
}; 