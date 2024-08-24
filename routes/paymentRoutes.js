import express from "express";
const router = express.Router();
import {
  createPayment,
  handlePaymentCallback,
} from "../controllers/paymentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

router.post("/create-payment", authMiddleware, createPayment);
router.get("/payment-callback", handlePaymentCallback);

export default router;
