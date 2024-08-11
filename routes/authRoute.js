import express from "express";
import rateLimiter from "express-rate-limit";
import passport from "passport";
import {
  postRegister,
  postLogin,
  getLogout,
  googleCallback,
  facebookCallback,
  postForgotPassword,
  getResetPassword,
  postResetPassword,
} from "../controllers/authController.js";
import { validateUserInput } from "../middlewares/validation.js";

// Rate Limiter
const apiLimiter = rateLimiter({
  windowMs: 1000 * 60 * 15,
  max: 15,
  message: { message: "IP rate limit exceeded, try again in 15 minutes" },
});

const router = express.Router();

// Register
router.post("/register", apiLimiter, postRegister);

// Login
router.post("/login", apiLimiter, postLogin);

// Logout
router.get("/logout", getLogout);

// Google Auth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleCallback
);

// Facebook Auth
router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  facebookCallback
);

// Forgot Password
router.post("/forgot", postForgotPassword);

// Reset Password
router.get("/reset/:token", getResetPassword);
router.post("/reset/:token", postResetPassword);

export default router;
