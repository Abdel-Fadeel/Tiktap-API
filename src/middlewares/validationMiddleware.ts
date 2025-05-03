import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { BadRequestError } from '../errors/customErrors.js';
import { IResponse } from '../types/index.js';

export const withValidationErrors = (validations: any[]) => {
  return [
    ...validations,
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new BadRequestError(
          errors.array().map((error) => error.msg).join(', ')
        );
      }
      next();
    },
  ];
}; 