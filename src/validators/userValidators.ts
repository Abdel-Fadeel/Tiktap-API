import { body } from "express-validator";
import User from "../features/users/userModel.js";
import { withValidationErrors } from "../middlewares/validationMiddleware.js";
import { BadRequestError } from "../errors/customErrors.js";
import { IUser } from "../types/index.js";

// Validate NEW User Inputs
export const validateUserRegister = withValidationErrors([
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email: string) => {
      const user = await User.findOne({ email });
      if (user) throw new BadRequestError("Email already exists");
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^(\+966|0)?5\d{8}$/)
    .withMessage("Phone number must be a valid Saudi number"),
]);

// Validate Login Inputs
export const validateUserLogin = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .trim(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
]);

// Validate Google User Inputs
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

// Validate User Input on UPDATE
export const validateUpdateUser = withValidationErrors([
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email: string, { req }) => {
      if (email) {
        const user = await User.findOne({ email }) as IUser;
        if (user && user._id.toString() !== req.user.id) {
          throw new BadRequestError("Email already exists");
        }
      }
    }),

  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^(\+966|0)?5\d{8}$/)
    .withMessage("Phone number must be a valid Saudi number"),

  body("currentPassword")
    .optional()
    .notEmpty()
    .withMessage("Current password is required when changing password"),

  body("newPassword")
    .optional()
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage("New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    .custom((value: string, { req }) => {
      if (value && !req.body.currentPassword) {
        throw new BadRequestError("Current password is required when changing password");
      }
      return true;
    }),
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
    .withMessage("Reset token is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage("New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
]);

export const validateForgotPassword = withValidationErrors([
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
]); 