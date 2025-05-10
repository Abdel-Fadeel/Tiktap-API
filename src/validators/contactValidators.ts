import { body, param } from "express-validator";
import { withValidationErrors } from "../middlewares/validationMiddleware.js";
import Contact from "../features/contacts/contactModel.js";
import { BadRequestError } from "../errors/customErrors.js";
import mongoose from "mongoose";

export const validateCreateContact = withValidationErrors([
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Full name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email: string, { req }) => {
      const contact = await Contact.findOne({ 
        email, 
        profileId: req.body.profileId 
      });
      if (contact) throw new BadRequestError("Contact with this email already exists in this profile");
    }),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^(\+966|0)?5\d{8}$/)
    .withMessage("Phone number must be a valid Saudi number"),

  body("profileId")
    .notEmpty()
    .withMessage("Profile ID is required")
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Profile ID");
      }
      return true;
    }),

  body("title")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Title cannot exceed 50 characters"),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Note cannot exceed 500 characters"),
]);

export const validateUpdateContact = withValidationErrors([
  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Full name must be between 2 and 50 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email: string, { req }) => {
      if (email && req.params?.id) {
        const contact = await Contact.findOne({ 
          email, 
          profileId: req.body.profileId,
          _id: { $ne: req.params.id }
        });
        if (contact) {
          throw new BadRequestError("Contact with this email already exists in this profile");
        }
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

  body("note")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Note cannot exceed 500 characters"),
]);

export const validateContactId = withValidationErrors([
  param("id")
    .notEmpty()
    .withMessage("Contact ID is required")
    .custom((value: string) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Contact ID");
      }
      return true;
    }),
]); 