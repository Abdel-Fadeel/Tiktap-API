import { Router } from "express";
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
} from "@/validators/profileValidators.js";
import { withValidationErrors } from "@/middlewares/validationMiddleware.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";

const router = Router();

router
  .route("/")
  .get(authMiddleware, getProfiles)
  .post(authMiddleware, validateCreateProfile, withValidationErrors(validateCreateProfile), createProfile);

router
  .route("/:id")
  .get(authMiddleware, getProfileById)
  .put(authMiddleware, validateUpdateProfile, withValidationErrors(validateUpdateProfile), updateProfile)
  .delete(authMiddleware, deleteProfile);

router.post("/addLink", authMiddleware, validateAddUpdateLink, withValidationErrors(validateAddUpdateLink), addLink);
router.put("/updateLink/:linkId", authMiddleware, validateAddUpdateLink, withValidationErrors(validateAddUpdateLink), updateLink);
router.delete("/deleteLink/:linkId", authMiddleware, validateDeleteLink, withValidationErrors(validateDeleteLink), deleteLink);

export default router; 