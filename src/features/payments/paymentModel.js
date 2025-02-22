import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Assuming you have a Product model
    required: true,
  },
  invoiceId: {
    type: String,
    required: true,
    unique: true, // Ensures each invoice ID is unique
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "SAR",
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["initiated", "paid", "failed"],
    required: true,
    default: "initiated",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
