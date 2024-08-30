import { body } from "express-validator";
import User from "../models/User.js";
import { withValidationErrors } from "../middlewares/validation.js";
import Profile from "../models/Profile.js";
import { BadRequestError } from "../errors/customErrors.js";
import { validateURL } from "../utils/urlValidationUtils.js";
import mongoose from "mongoose";

export const validateCreateProfile = withValidationErrors([
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .custom(async (username) => {
      const profile = await Profile.findOne({ username });
      if (profile) throw new BadRequestError("Username already exists");
    }),
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^(\+966|0)?5\d{8}$/)
    .withMessage("Phone number must be a valid Saudi number"),
]);

export const validateUpdateProfile = withValidationErrors([
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .custom(async (username, { req }) => {
      const profile = await Profile.findOne({ username });
      if (profile.userId.toString() !== req.userId)
        throw new BadRequestError("Username already exists");
    }),
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^(\+966|0)?5\d{8}$/)
    .withMessage("Phone number must be a valid Saudi number"),
  body("title").optional().trim(), // Optional title field
]);

export const validateAddUpdateLink = withValidationErrors([
  body("type").trim().notEmpty().withMessage("Type is required"),

  body("url")
    .trim()
    .notEmpty()
    .withMessage("URL is required")
    .isURL()
    .withMessage("URL must be a valid URL")
    .custom((url, { req }) => {
      const { type } = req.body;
      if (!validateURL(type, url)) {
        throw new BadRequestError(`Invalid ${type} URL`);
      }
      return true;
    }),

  body("isEnabled")
    .optional()
    .isBoolean()
    .withMessage("isEnabled must be a boolean"),

  body("profileId")
    .notEmpty()
    .withMessage("Profile ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Profile ID");
      }
      return true;
    }),
]);

export const validateDeleteLink = withValidationErrors([
  body("profileId")
    .notEmpty()
    .withMessage("Profile ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Profile ID");
      }
      return true;
    }),
]);
