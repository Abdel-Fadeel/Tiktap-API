import express from "express";
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

const router = express.Router();

// Register
router.post("/register", postRegister);

// Login
router.post("/login", postLogin);

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
