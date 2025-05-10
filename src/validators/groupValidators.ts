import { body, param } from "express-validator";
import { withValidationErrors } from "../middlewares/validationMiddleware.js";
import Group from "../features/groups/groupModel.js";
import { BadRequestError } from "../errors/customErrors.js";
import mongoose from "mongoose";

export const validateCreateGroup = withValidationErrors([
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Group name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Group name must be between 2 and 50 characters")
    .custom(async (name: string, { req }) => {
      const group = await Group.findOne({ name, userId: req.user?.id });
      if (group) throw new BadRequestError("Group with this name already exists");
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("contacts")
    .optional()
    .isArray()
    .withMessage("Contacts must be an array")
    .custom((contacts: string[]) => {
      if (contacts) {
        for (const contactId of contacts) {
          if (!mongoose.Types.ObjectId.isValid(contactId)) {
            throw new BadRequestError("Invalid Contact ID in contacts array");
          }
        }
      }
      return true;
    }),
]);

export const validateUpdateGroup = withValidationErrors([
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Group name must be between 2 and 50 characters")
    .custom(async (name: string, { req }) => {
      if (name && req.params?.id) {
        const group = await Group.findOne({ 
          name, 
          userId: req.user?.id,
          _id: { $ne: req.params.id }
        });
        if (group) {
          throw new BadRequestError("Group with this name already exists");
        }
      }
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("contacts")
    .optional()
    .isArray()
    .withMessage("Contacts must be an array")
    .custom((contacts: string[]) => {
      if (contacts) {
        for (const contactId of contacts) {
          if (!mongoose.Types.ObjectId.isValid(contactId)) {
            throw new BadRequestError("Invalid Contact ID in contacts array");
          }
        }
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

export const validateAddContactsToGroup = withValidationErrors([
  body("contacts")
    .isArray()
    .withMessage("Contacts must be an array")
    .notEmpty()
    .withMessage("At least one contact is required")
    .custom((contacts: string[]) => {
      for (const contactId of contacts) {
        if (!mongoose.Types.ObjectId.isValid(contactId)) {
          throw new BadRequestError("Invalid Contact ID in contacts array");
        }
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