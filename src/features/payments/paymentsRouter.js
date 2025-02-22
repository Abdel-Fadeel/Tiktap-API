import express from "express";
import { createPayment, handlePaymentCallback } from "./paymentsController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

export const paymentsRouter = express.Router();

paymentsRouter.post("/create-payment", authMiddleware, createPayment);
paymentsRouter.get("/payment-callback", handlePaymentCallback);
