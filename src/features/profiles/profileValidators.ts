import { body, param } from "express-validator";
import { withValidationErrors } from "@/middlewares/validationMiddleware.js";
import Profile from "./profileModel.js";
import { BadRequestError } from "@/errors/customErrors.js";
import mongoose from "mongoose";
import { IRequest } from "@/types/index.js";

export const validateCreateProfile = withValidationErrors([
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers and underscores")
    .custom(async (username: string) => {
      const profile = await Profile.findOne({ username });
      if (profile) throw new BadRequestError("Username already taken");
    }),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^(\+966|0)?5\d{8}$/)
    .withMessage("Phone number must be a valid Saudi number"),

  body("title")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Title cannot exceed 50 characters"),
]);

export const validateUpdateProfile = withValidationErrors([
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers and underscores")
    .custom(async (username: string, { req }) => {
      if (username) {
        const profile = await Profile.findOne({ 
          username, 
          _id: { $ne: req.params?.id } 
        });
        if (profile) throw new BadRequestError("Username already taken");
      }
    }),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email: string, { req }) => {
      if (email) {
        const profile = await Profile.findOne({ 
          email, 
          _id: { $ne: req.params?.id } 
        });
        if (profile) throw new BadRequestError("Email already registered");
      }
    }),

  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^(\+966|0)?5\d{8}$/)
    .withMessage("Phone number must be a valid Saudi number"),

  body("title")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Title cannot exceed 50 characters"),

  body("links")
    .optional()
    .isArray()
    .withMessage("Links must be an array")
    .custom((value: any[]) => {
      if (value && !value.every(link => 
        typeof link === 'object' && 
        typeof link.type === 'string' && 
        typeof link.url === 'string' &&
        typeof link.isEnabled === 'boolean'
      )) {
        throw new BadRequestError("Invalid link format");
      }
      return true;
    }),
]);

export const validateProfileId = withValidationErrors([
  param("id")
    .notEmpty()
    .withMessage("Profile ID is required")
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Profile ID");
      }
      return true;
    }),
]);

export const validateProfileExists = async (req: IRequest) => {
  const profile = await Profile.findOne({ 
    _id: req.params.id, 
    userId: req.user?.id 
  });
  if (!profile) throw new BadRequestError("Profile not found!");
  return profile;
};

export const validateAddUpdateLink = withValidationErrors([
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Link type is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Link type must be between 2 and 50 characters"),

  body("url")
    .trim()
    .notEmpty()
    .withMessage("URL is required")
    .isURL()
    .withMessage("Invalid URL format"),

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
  param("linkId")
    .notEmpty()
    .withMessage("Link ID is required")
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Link ID");
      }
      return true;
    }),

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