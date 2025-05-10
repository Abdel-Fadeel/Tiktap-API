import express from "express";
import {
  validateCreateGroup,
  validateUpdateGroup,
  validateGroupId,
  validateAddContactToGroup,
  validateRemoveContactFromGroup,
} from "./groupValidators.js";
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addContactToGroup,
  removeContactFromGroup,
} from "./groupsController.js";
import { upload } from "@/utils/uploadUtils.js";

export const groupsRouter = express.Router();

// Get all groups
groupsRouter.get("/", getGroups);

// Get single group
groupsRouter.get("/:id", validateGroupId, getGroupById);

// Create group
groupsRouter.post("/", upload.single("photo"), validateCreateGroup, createGroup);

// Update group
groupsRouter.put("/:id", upload.single("photo"), validateGroupId, validateUpdateGroup, updateGroup);

// Delete group
groupsRouter.delete("/:id", validateGroupId, deleteGroup);

// Add contact to group
groupsRouter.post("/addContact", validateAddContactToGroup, addContactToGroup);

// Remove contact from group
groupsRouter.post("/removeContact", validateRemoveContactFromGroup, removeContactFromGroup); 