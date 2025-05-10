import { body } from "express-validator";
import { withValidationErrors } from "@/middlewares/validationMiddleware.js";
import User from "./userModel.js";
import { BadRequestError } from "@/errors/customErrors.js";

export const validateRegister = withValidationErrors([
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email: string) => {
      const user = await User.findOne({ email });
      if (user) throw new BadRequestError("Email already registered");
    }),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^(\+966|0)?5\d{8}$/)
    .withMessage("Phone number must be a valid Saudi number"),
]);

export const validateLogin = withValidationErrors([
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required"),
]);

export const validateGoogleLogin = withValidationErrors([
  body("googleId")
    .trim()
    .notEmpty()
    .withMessage("Google ID is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
]);

export const validateResetPassword = withValidationErrors([
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("token")
    .trim()
    .notEmpty()
    .withMessage("Token is required"),

  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"),
]);

export const validateForgotPassword = withValidationErrors([
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
]); 