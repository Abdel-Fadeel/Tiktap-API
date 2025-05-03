import { body } from "express-validator";
import { withValidationErrors } from "../middlewares/validationMiddleware.js";
import Contact from "../features/contacts/contactModel.js";
import { BadRequestError } from "../errors/customErrors.js";
import mongoose from "mongoose";

export const validateCreateContact = withValidationErrors([
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const contact = await Contact.findOne({ email });
      if (contact) throw new BadRequestError("Contact with this email already exists");
    }),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^(\+966|0)?5\d{8}$/)
    .withMessage("Phone number must be a valid Saudi number"),

  body("group")
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Group ID");
      }
      return true;
    }),

  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
]);

export const validateUpdateContact = withValidationErrors([
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
    .custom(async (email, { req }) => {
      if (email) {
        const contact = await Contact.findOne({ email });
        if (contact && contact._id.toString() !== req.params.id) {
          throw new BadRequestError("Contact with this email already exists");
        }
      }
    }),

  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^(\+966|0)?5\d{8}$/)
    .withMessage("Phone number must be a valid Saudi number"),

  body("group")
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Group ID");
      }
      return true;
    }),

  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
]);

export const validateContactId = withValidationErrors([
  body("contactId")
    .notEmpty()
    .withMessage("Contact ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError("Invalid Contact ID");
      }
      return true;
    }),
]); 