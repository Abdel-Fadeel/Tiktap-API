import express from "express";
import {
  validateCreateGroup,
  validateUpdateGroup,
  validateGroupId,
  validateAddContactsToGroup,
} from "../../validators/groupValidators.js";
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

// Create new group
groupsRouter.post("/", validateCreateGroup, createGroup);

// Get single group
groupsRouter.get("/:id", validateGroupId, getGroupById);

// Update group
groupsRouter.put("/:id", validateGroupId, validateUpdateGroup, updateGroup);

// Delete group
groupsRouter.delete("/:id", validateGroupId, deleteGroup);

// Add contact to group
groupsRouter.post("/addContact", validateAddContactsToGroup, addContactToGroup);

// Remove contact from group
groupsRouter.post("/removeContact", validateAddContactsToGroup, removeContactFromGroup); 