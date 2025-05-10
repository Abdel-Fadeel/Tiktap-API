import { body, param } from "express-validator";
import { withValidationErrors } from "@/middlewares/validationMiddleware.js";
import Group from "./groupModel.js";
import { BadRequestError } from "@/errors/customErrors.js";
import mongoose from "mongoose";

export const validateCreateGroup = withValidationErrors([
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Note cannot exceed 500 characters"),

  body("profileId")
    .notEmpty()
    .withMessage("Profile ID is required")
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Profile ID");
      }
      return true;
    }),

  body("contacts")
    .optional()
    .isArray()
    .withMessage("Contacts must be an array")
    .custom((value: string[]) => {
      if (value && !value.every(id => mongoose.Types.ObjectId.isValid(id))) {
        throw new BadRequestError("Invalid Contact ID in contacts array");
      }
      return true;
    }),
]);

export const validateUpdateGroup = withValidationErrors([
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Note cannot exceed 500 characters"),

  body("contacts")
    .optional()
    .isArray()
    .withMessage("Contacts must be an array")
    .custom((value: string[]) => {
      if (value && !value.every(id => mongoose.Types.ObjectId.isValid(id))) {
        throw new BadRequestError("Invalid Contact ID in contacts array");
      }
      return true;
    }),
]);

export const validateGroupId = withValidationErrors([
  param("id")
    .notEmpty()
    .withMessage("Group ID is required")
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Group ID");
      }
      return true;
    }),
]);

export const validateAddContactToGroup = withValidationErrors([
  body("groupId")
    .notEmpty()
    .withMessage("Group ID is required")
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Group ID");
      }
      return true;
    }),

  body("contactId")
    .notEmpty()
    .withMessage("Contact ID is required")
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Contact ID");
      }
      return true;
    }),
]);

export const validateRemoveContactFromGroup = withValidationErrors([
  body("groupId")
    .notEmpty()
    .withMessage("Group ID is required")
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Group ID");
      }
      return true;
    }),

  body("contactId")
    .notEmpty()
    .withMessage("Contact ID is required")
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Contact ID");
      }
      return true;
    }),
]); 