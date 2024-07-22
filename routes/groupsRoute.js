import express from "express";
const router = express.Router();
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addContactToGroup,
  removeContactFromGroup,
} from "../controllers/groupController.js";

router.route("/").get(getGroups).post(createGroup);

router.route("/:id").get(getGroupById).put(updateGroup).delete(deleteGroup);

router.post("/addContact", addContactToGroup);
router.post("/removeContact", removeContactFromGroup);

export default router;
