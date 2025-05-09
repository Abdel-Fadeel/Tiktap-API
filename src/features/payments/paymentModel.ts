import mongoose from 'mongoose';
import { IPayment } from '@/types/index.js';

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  invoiceId: {
    type: String,
    unique: true,
  },
  amount: {
    type: Number,
  },
  currency: {
    type: String,
    default: "SAR",
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ["initiated", "paid", "failed", "refunded"],
    default: "initiated",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment; 