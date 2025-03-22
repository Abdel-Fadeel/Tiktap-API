import express from "express";
import rateLimiter from "express-rate-limit";
import {
  googleLogin,
  register,
  login,
} from "./authController.js";
import {
  validateGoogleLogin,
  validateUserLogin,
  validateUserRegister,
} from "../../validators/userValidators.js";

// Rate Limiter
const apiLimiter = rateLimiter({
  windowMs: 1000 * 60 * 15,
  max: 15,
  message: { message: "IP rate limit exceeded, try again in 15 minutes" },
});

export const authRouter = express.Router();

// Register
authRouter.post("/register", apiLimiter, validateUserRegister, register);

// Login
authRouter.post("/login", apiLimiter, validateUserLogin, login);

// Google Auth
authRouter.post("/google", apiLimiter, validateGoogleLogin, googleLogin);

