import express from "express";

export const contactsRouter = express.Router();
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "./contactsController.js";

contactsRouter.route("/").get(getContacts).post(createContact);

contactsRouter
  .route("/:id")
  .get(getContactById)
  .put(updateContact)
  .delete(deleteContact);
