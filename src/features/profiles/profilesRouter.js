import express from "express";

export const profilesRouter = express.Router();
import {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  addLink,
  updateLink,
  deleteLink,
} from "./profilesController.js";
import {
  validateAddUpdateLink,
  validateCreateProfile,
  validateDeleteLink,
  validateUpdateProfile,
} from "../../validators/profileValidators.js";

profilesRouter
  .route("/")
  .get(getProfiles)
  .post(validateCreateProfile, createProfile);

profilesRouter
  .route("/:id")
  .get(getProfileById)
  // .put(upload.single("photo"), updateProfile)
  .put(validateUpdateProfile, updateProfile)
  .delete(deleteProfile);

profilesRouter.post("/addLink", validateAddUpdateLink, addLink);
profilesRouter.put("/updateLink/:linkId", validateAddUpdateLink, updateLink);
profilesRouter.delete("/deleteLink/:linkId", validateDeleteLink, deleteLink);
