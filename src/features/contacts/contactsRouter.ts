import express from "express";
import {
  validateCreateContact,
  validateUpdateContact,
  validateContactId,
} from "../../validators/contactValidators.js";
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "./contactsController.js";

export const contactsRouter = express.Router();

// Get all contacts
contactsRouter.get("/", getContacts);

// Create new contact
contactsRouter.post("/", validateCreateContact, createContact);

// Get single contact
contactsRouter.get("/:id", validateContactId, getContactById);

// Update contact
contactsRouter.put("/:id", validateContactId, validateUpdateContact, updateContact);

// Delete contact
contactsRouter.delete("/:id", validateContactId, deleteContact); 