import { body } from "express-validator";
import { withValidationErrors } from "../middlewares/validationMiddleware.js";
import Profile from "../features/profiles/profileModel.js";
import { BadRequestError } from "../errors/customErrors.js";
import { validateURL } from "../utils/urlValidationUtils.js";
import mongoose from "mongoose";

export const validateCreateProfile = withValidationErrors([
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .custom(async (username: string) => {
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
    .custom(async (username: string, { req }) => {
      if (!req.params?.id) {
        throw new BadRequestError("Profile ID is required");
      }
      const profile = await Profile.findOne({ 
        username,
        _id: { $ne: req.params.id }
      });
      if (profile) {
        throw new BadRequestError("Username already exists");
      }
    }),
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^(\+966|0)?5\d{8}$/)
    .withMessage("Phone number must be a valid Saudi number"),
  body("title").optional().trim(), // Optional title field
]);

export const validateProfileExists = async (req: any) => {
  const profile = await Profile.findOne({ _id: req.params.id, userId: req.user?.id });
  if (!profile) throw new BadRequestError("Profile not found!");
  return profile;
};

export const validateAddUpdateLink = withValidationErrors([
  body("type").trim().notEmpty().withMessage("Type is required"),
  body("url")
    .trim()
    .notEmpty()
    .withMessage("URL is required")
    .isURL()
    .withMessage("URL must be a valid URL")
    .custom((url: string, { req }) => {
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
    .custom((value: string) => {
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
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Profile ID");
      }
      return true;
    }),
]); 