import { body, param } from "express-validator";
import { withValidationErrors } from "@/middlewares/validationMiddleware.js";
import { BadRequestError } from "@/errors/customErrors.js";
import mongoose from "mongoose";

export const validateCreatePayment = withValidationErrors([
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Product ID");
      }
      return true;
    }),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),

  body("currency")
    .trim()
    .notEmpty()
    .withMessage("Currency is required")
    .isIn(["SAR", "USD", "EUR"])
    .withMessage("Currency must be one of: SAR, USD, EUR"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
]);

export const validateUpdatePayment = withValidationErrors([
  body("status")
    .optional()
    .trim()
    .isIn(["initiated", "paid", "failed", "refunded"])
    .withMessage("Status must be one of: initiated, paid, failed, refunded"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
]);

export const validatePaymentId = withValidationErrors([
  param("id")
    .notEmpty()
    .withMessage("Payment ID is required")
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Payment ID");
      }
      return true;
    }),
]);

export const validateRefundPayment = withValidationErrors([
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Refund reason is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Reason must be between 10 and 500 characters"),
]); 