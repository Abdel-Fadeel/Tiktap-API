import express from "express";

export const groupsRouter = express.Router();
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addContactToGroup,
  removeContactFromGroup,
} from "./groupsController.js";

groupsRouter.route("/").get(getGroups).post(createGroup);

groupsRouter
  .route("/:id")
  .get(getGroupById)
  .put(updateGroup)
  .delete(deleteGroup);

groupsRouter.post("/addContact", addContactToGroup);
groupsRouter.post("/removeContact", removeContactFromGroup);
