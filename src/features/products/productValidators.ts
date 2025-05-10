import { body, param } from "express-validator";
import { withValidationErrors } from "@/middlewares/validationMiddleware.js";
import Product from "./productModel.js";
import { BadRequestError } from "@/errors/customErrors.js";
import mongoose from "mongoose";

export const validateCreateProduct = withValidationErrors([
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category must be between 2 and 50 characters"),

  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),
]);

export const validateUpdateProduct = withValidationErrors([
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("category")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category must be between 2 and 50 characters"),

  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),
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