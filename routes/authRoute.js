import express from "express";
import rateLimiter from "express-rate-limit";
import {
  postForgotPassword,
  getResetPassword,
  postResetPassword,
  googleLogin,
  facebookLogin,
  register,
  login,
} from "../controllers/authController.js";
import {
  validateFacebookLogin,
  validateGoogleLogin,
  validateLoginInput,
  validateUserInput,
} from "../middlewares/validation.js";

// Rate Limiter
const apiLimiter = rateLimiter({
  windowMs: 1000 * 60 * 15,
  max: 15,
  message: { message: "IP rate limit exceeded, try again in 15 minutes" },
});

const router = express.Router();

// Register
router.post("/register", apiLimiter, validateUserInput, register);

// Login
router.post("/login", apiLimiter, validateLoginInput, login);

// Google Auth
router.post("/google", apiLimiter, validateGoogleLogin, googleLogin);

// Google Auth
router.post("/facebook", apiLimiter, validateFacebookLogin, facebookLogin);

// Forgot Password
router.post("/forgot", apiLimiter, postForgotPassword);

// Reset Password
router.get("/reset/:token", apiLimiter, getResetPassword);
router.post("/reset/:token", apiLimiter, postResetPassword);

export default router;
