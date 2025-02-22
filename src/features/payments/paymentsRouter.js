import express from "express";
import { createPayment, handlePaymentCallback } from "./paymentController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

export const paymentsRouter = express.Router();

paymentsRouter.post("/create-payment", authMiddleware, createPayment);
paymentsRouter.get("/payment-callback", handlePaymentCallback);
