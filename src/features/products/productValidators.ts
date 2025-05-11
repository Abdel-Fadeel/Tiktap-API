import { body, param } from "express-validator";
import { withValidationErrors } from "@/middlewares/validationMiddleware.js";
import { BadRequestError, UnauthorizedError } from "@/errors/customErrors.js";
import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { IRequest } from "@/types/index.js";

// Admin check middleware
export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as IRequest).user?.isAdmin) {
    throw new UnauthorizedError("Only admins can perform this action");
  }
  next();
};

// Product validators
const validateName = body("name")
  .trim()
  .notEmpty()
  .withMessage("Name is required")
  .isLength({ min: 2, max: 50 })
  .withMessage("Name must be between 2 and 50 characters");

const validatePrice = body("price")
  .notEmpty()
  .withMessage("Price is required")
  .isFloat({ min: 0 })
  .withMessage("Price must be a positive number");

const validateDescription = body("description")
  .optional()
  .trim()
  .isLength({ max: 1000 })
  .withMessage("Description cannot exceed 1000 characters");

export const validateCreateProduct = withValidationErrors([
  validateName,
  validatePrice,
  validateDescription
]);

export const validateUpdateProduct = withValidationErrors([
  validateName.optional(),
  validatePrice.optional(),
  validateDescription
]);

export const validateProductId = withValidationErrors([
  param("id")
    .notEmpty()
    .withMessage("Product ID is required")
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Product ID");
      }
      return true;
    }),
]); 