import express from "express";
const router = express.Router();
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "../controllers/contactController.js";

router.route("/").get(getContacts).post(createContact);

router
  .route("/:id")
  .get(getContactById)
  .put(updateContact)
  .delete(deleteContact);

export default router;
