import { body } from "express-validator";
import { withValidationErrors } from "../middlewares/validationMiddleware.js";
import Product from "../features/products/productModel.js";
import { BadRequestError } from "../errors/customErrors.js";
import mongoose from "mongoose";

export const validateCreateProduct = withValidationErrors([
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters")
    .custom(async (name) => {
      const product = await Product.findOne({ name });
      if (product) throw new BadRequestError("Product with this name already exists");
    }),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: 50 })
    .withMessage("Category cannot exceed 50 characters"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array")
    .custom((images) => {
      if (images && images.length > 5) {
        throw new BadRequestError("Maximum 5 images allowed");
      }
      return true;
    }),

  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array")
    .custom((features) => {
      if (features) {
        for (const feature of features) {
          if (typeof feature !== "string") {
            throw new BadRequestError("Each feature must be a string");
          }
        }
      }
      return true;
    }),
]);

export const validateUpdateProduct = withValidationErrors([
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters")
    .custom(async (name, { req }) => {
      if (name) {
        const product = await Product.findOne({ name });
        if (product && product._id.toString() !== req.params.id) {
          throw new BadRequestError("Product with this name already exists");
        }
      }
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("category")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Category cannot exceed 50 characters"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array")
    .custom((images) => {
      if (images && images.length > 5) {
        throw new BadRequestError("Maximum 5 images allowed");
      }
      return true;
    }),

  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array")
    .custom((features) => {
      if (features) {
        for (const feature of features) {
          if (typeof feature !== "string") {
            throw new BadRequestError("Each feature must be a string");
          }
        }
      }
      return true;
    }),
]);

export const validateProductId = withValidationErrors([
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Product ID");
      }
      return true;
    }),
]); 