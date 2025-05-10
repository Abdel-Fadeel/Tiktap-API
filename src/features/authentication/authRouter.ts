import express from "express";
import rateLimiter from "express-rate-limit";
import {
  googleLogin,
  register,
  login,
  resetPassword,
  forgotPassword,
} from "./authController.js";
import {
  validateGoogleLogin,
  validateLogin,
  validateRegister,
  validateResetPassword,
  validateForgotPassword,
} from "../users/userValidators.js";

// Rate Limiter
const apiLimiter = rateLimiter({
  windowMs: 1000 * 60 * 15,
  limit: 15,
  message: { message: "IP rate limit exceeded, try again in 15 minutes" },
});

export const authRouter = express.Router();

// Register
authRouter.post("/register", apiLimiter, validateRegister, register);

// Login
authRouter.post("/login", apiLimiter, validateLogin, login);

// Google Auth
authRouter.post("/google", apiLimiter, validateGoogleLogin, googleLogin);

// Forgot Password
authRouter.post("/forgot-password", apiLimiter, validateForgotPassword, forgotPassword);

// Reset Password
authRouter.post("/reset-password", apiLimiter, validateResetPassword, resetPassword); 