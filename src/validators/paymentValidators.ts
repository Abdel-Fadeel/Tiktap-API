import { body } from "express-validator";
import { withValidationErrors } from "../middlewares/validationMiddleware.js";
import { BadRequestError } from "../errors/customErrors.js";
import mongoose from "mongoose";

interface IProduct {
  productId: string;
  quantity: number;
}

interface ICustomer {
  name: string;
  email: string;
  phone: string;
}

export const validateCreatePayment = withValidationErrors([
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
    .withMessage("Invalid currency. Must be SAR, USD, or EUR"),

  body("paymentMethod")
    .trim()
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["credit_card", "apple_pay", "google_pay", "mada"])
    .withMessage("Invalid payment method"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("products")
    .isArray()
    .withMessage("Products must be an array")
    .notEmpty()
    .withMessage("At least one product is required")
    .custom((products: IProduct[]) => {
      for (const product of products) {
        if (!product.productId || !mongoose.Types.ObjectId.isValid(product.productId)) {
          throw new BadRequestError("Invalid Product ID in products array");
        }
        if (!product.quantity || !Number.isInteger(product.quantity) || product.quantity < 1) {
          throw new BadRequestError("Invalid quantity for product");
        }
      }
      return true;
    }),

  body("customer")
    .notEmpty()
    .withMessage("Customer information is required")
    .custom((customer: ICustomer) => {
      if (!customer.name || !customer.email || !customer.phone) {
        throw new BadRequestError("Customer must have name, email, and phone");
      }
      if (!/^(\+966|0)?5\d{8}$/.test(customer.phone)) {
        throw new BadRequestError("Invalid Saudi phone number");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
        throw new BadRequestError("Invalid email format");
      }
      return true;
    }),
]);

export const validatePaymentId = withValidationErrors([
  body("paymentId")
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
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),

  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Refund reason is required")
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),
]); 