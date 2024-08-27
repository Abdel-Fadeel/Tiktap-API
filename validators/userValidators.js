import { body } from "express-validator";
import User from "../models/User.js";
import { withValidationErrors } from "../middlewares/validation.js";

// Validate NEW User Inputs
export const validateUserRegister = withValidationErrors([
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) throw new BadRequestError("Email already exists");
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
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
  body("googleId").trim().notEmpty().withMessage("Google ID is required"),
]);

// Validate Facebook User Inputs
export const validateFacebookLogin = withValidationErrors([
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("facebookId").trim().notEmpty().withMessage("Facebook ID is required"),
]);

// Validate User Input on UPDATE
// export const validateUpdateUserInput = withValidationErrors([
//   body("name").notEmpty().withMessage("Name is required.").trim(),
//   body("email")
//     .notEmpty()
//     .withMessage("Email is required.")
//     .isEmail()
//     .withMessage("Invalid email format.")
//     .trim()
//     .custom(async (email, { req }) => {
//       // Check if NEW Email Exists
//       const user = await User.findOne({ email });
//       if (user && user._id.toString() !== req.user.id)
//         throw new BadRequestError("Email already exists.");
//     }),
//   body("location").notEmpty().withMessage("Location is required.").trim(),
//   body("lastName").notEmpty().withMessage("Last name is required.").trim(),
// ]);
