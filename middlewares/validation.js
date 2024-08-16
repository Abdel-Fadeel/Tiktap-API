import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { BadRequestError, UnauthorizedError } from "../errors/customErrors.js";

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg);
        // Not Authorized
        if (errorMessages[0].startsWith("Not authorized"))
          throw new UnauthorizedError(errorMessages.join(" "));
        // Bad Request (default)
        throw new BadRequestError(errorMessages.join(" "));
      }
      next();
    },
  ];
};

// Validate NEW User Inputs
export const validateUserInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format.")
    .trim()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) throw new BadRequestError("Email already exists.");
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
]);

// Validate Google User Inputs
export const validateGoogleLogin = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format.")
    .trim(),
  body("name").notEmpty().withMessage("Name is required.").trim(),
  body("googleId").notEmpty().withMessage("Google ID is required.").trim(),
]);

// Validate Facebook User Inputs
export const validateFacebookLogin = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format.")
    .trim(),
  body("name").notEmpty().withMessage("Name is required.").trim(),
  body("facebookId").notEmpty().withMessage("Facebook ID is required.").trim(),
]);

// Validate User Input on UPDATE
export const validateUpdateUserInput = withValidationErrors([
  body("name").notEmpty().withMessage("Name is required.").trim(),
  body("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format.")
    .trim()
    .custom(async (email, { req }) => {
      // Check if NEW Email Exists
      const user = await User.findOne({ email });
      if (user && user._id.toString() !== req.user.id)
        throw new BadRequestError("Email already exists.");
    }),
  body("location").notEmpty().withMessage("Location is required.").trim(),
  body("lastName").notEmpty().withMessage("Last name is required.").trim(),
]);

// Validate Login Inputs
export const validateLoginInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format.")
    .trim(),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .trim(),
]);
