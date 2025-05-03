import express from "express";
import {
  validateCreatePayment,
  validatePaymentId,
  validateRefundPayment,
} from "../../validators/paymentValidators.js";
import { 
  createPayment, 
  handlePaymentCallback,
  getPaymentById,
  refundPayment,
} from "./paymentsController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

export const paymentsRouter = express.Router();

// Create new payment
paymentsRouter.post("/create-payment", authMiddleware, validateCreatePayment, createPayment);

// Handle payment callback
paymentsRouter.get("/payment-callback", handlePaymentCallback);

// Get payment by ID
paymentsRouter.get("/:id", authMiddleware, validatePaymentId, getPaymentById);

// Refund payment
paymentsRouter.post("/:id/refund", authMiddleware, validatePaymentId, validateRefundPayment, refundPayment); 