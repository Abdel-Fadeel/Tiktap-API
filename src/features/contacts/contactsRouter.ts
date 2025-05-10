import express from "express";
import {
  validateCreateContact,
  validateUpdateContact,
  validateContactId,
} from "./contactValidators.js";
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "./contactsController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { upload } from "@/utils/uploadUtils.js";

const router = express.Router();

router.use(authMiddleware);

// Get all contacts
router.get("/", getContacts);

// Create new contact
router.post("/", upload.single("photo"), validateCreateContact, createContact);

// Get single contact
router.get("/:id", validateContactId, getContactById);

// Update contact
router.put("/:id", upload.single("photo"), validateContactId, validateUpdateContact, updateContact);

// Delete contact
router.delete("/:id", validateContactId, deleteContact);

export default router; 