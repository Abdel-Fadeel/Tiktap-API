import { BadRequestError } from "../../errors/customErrors.js";
import Product from "../products/productModel.js";
import { StatusCodes } from "http-status-codes";
import User from "../users/userModel.js";
import Payment from "./paymentModel.js";

export const createPayment = async (req, res) => {
  const { userId } = req;
  const { productId } = req.body;

  // Fetch the product details
  const product = await Product.findOne({ _id: productId });
  if (!product) throw new BadRequestError("Product not found!");

  const user = await User.findOne({ _id: userId });
  if (!user) throw new BadRequestError("User not found!");

  if (product.price < 1)
    throw new BadRequestError("Price must be at least 1 SAR.");

  const response = await fetch("https://api.moyasar.com/v1/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${process.env.MOYASAR_API_KEY}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: product.price * 100,
      currency: "SAR",
      description: `Purchasing ${product.name}`,
      success_url: process.env.MOYASR_SUCCESS_URL,
    }),
  });

  if (!response.ok) throw new BadRequestError("Failed to create payment.");

  const paymentResponse = await response.json();

  const paymentData = {
    userId,
    productId,
    amount: product.price * 100,
    currency: "SAR",
    description: product.name,
    status: "initiated",
    invoiceId: paymentResponse.id,
  };

  await Payment.create(paymentData);

  res.status(StatusCodes.CREATED).json({ status: true, paymentUrl: paymentResponse.url });
};

export const handlePaymentCallback = async (req, res) => {
  const { status, id, invoice_id } = req.query;

  const payment = await Payment.findOne({ invoiceId: invoice_id });

  if (!payment)
    throw new BadRequestError(`Payment record not found for invoice ID: ${invoice_id}`);

  payment.status = status;

  if (status === "paid") {
    const user = await User.findById(payment.userId);

    if (!user) throw new BadRequestError("User not found!");

    const productIndex = user.products.findIndex(
        (product) => product.productId.toString() === payment.productId.toString()
    );

    if (productIndex !== -1) user.products[productIndex].amount += 1;
    else user.products.push({ productId: payment.productId, amount: 1 });

    await user.save();
  }

  await payment.save();

  res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f8ff;
            color: #333;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            background-color: #ffffff;
        }
        h1 {
            color: #28a745;
        }
        p {
            font-size: 1.2em;
        }
        a {
            text-decoration: none;
            color: #007bff;
            font-weight: bold;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Payment Successful!</h1>
        <p>Thank you for your payment. Your transaction has been completed.</p>
        <p>Your transaction ID is: <strong>${id}</strong></p>
    </div>
</body>
</html>
  `);
};
