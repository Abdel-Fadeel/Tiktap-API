import "express-async-errors";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import { authRouter } from "./features/authentication/authRouter.js";
import profilesRouter from "./features/profiles/profilesRouter.js";
import { groupsRouter } from "./features/groups/groupsRouter.js";
import contactsRouter from "./features/contacts/contactsRouter.js";
import productsRouter from "./features/products/productsRouter.js";
import { paymentsRouter } from "./features/payments/paymentsRouter.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import errorHandlerMiddleware from "./middlewares/errorHandlerMiddleware.js";
import { Request, Response, NextFunction } from "express";

// Access .env files
dotenv.config();

// Create HTTP Server
const app = express();

// Security Packages
app.use(helmet());
app.use(mongoSanitize());

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

const BASE_API_URL = "/api/v1";

// Routers
app.use(`${BASE_API_URL}/auth`, authRouter);
app.use(`${BASE_API_URL}/profiles`, authMiddleware, profilesRouter);
app.use(`${BASE_API_URL}/groups`, authMiddleware, groupsRouter);
app.use(`${BASE_API_URL}/contacts`, authMiddleware, contactsRouter);
app.use(`${BASE_API_URL}/products`, authMiddleware, productsRouter);
app.use(`${BASE_API_URL}/payments`, paymentsRouter);

// NOT FOUND Handler
app.use("*", (req: Request, res: Response, next: NextFunction) => {
  console.log(req);
  res.status(404).json({ message: "Route not found." });
});

// Global Error Handler
app.use(errorHandlerMiddleware);

// Connect to Database and Start listening
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    const port = process.env.PORT || 5100;
    app.listen(port, () =>
      console.log(`Server started listening on PORT ${port}...`)
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer(); 