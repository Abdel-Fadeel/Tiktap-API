import express from "express";
import {
  validateCreateGroup,
  validateUpdateGroup,
  validateGroupId,
  validateAddContactToGroup,
  validateRemoveContactFromGroup,
} from "@/validators/groupValidators.js";
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addContactToGroup,
  removeContactFromGroup,
} from "./groupsController.js";

export const groupsRouter = express.Router();

// Get all groups
groupsRouter.get("/", getGroups);

// Get single group
groupsRouter.get("/:id", validateGroupId, getGroupById);

// Create group
groupsRouter.post("/", validateCreateGroup, createGroup);

// Update group
groupsRouter.put("/:id", validateGroupId, validateUpdateGroup, updateGroup);

// Delete group
groupsRouter.delete("/:id", validateGroupId, deleteGroup);

// Add contact to group
groupsRouter.post("/addContact", validateAddContactToGroup, addContactToGroup);

// Remove contact from group
groupsRouter.post("/removeContact", validateRemoveContactFromGroup, removeContactFromGroup); 