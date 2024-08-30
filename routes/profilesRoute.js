import express from "express";
const router = express.Router();
import {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  addLink,
  updateLink,
  deleteLink,
} from "../controllers/profileController.js";
import {
  validateAddUpdateLink,
  validateCreateProfile,
  validateDeleteLink,
  validateUpdateProfile,
} from "../validators/profileValidators.js";

router.route("/").get(getProfiles).post(validateCreateProfile, createProfile);

router
  .route("/:id")
  .get(getProfileById)
  // .put(upload.single("photo"), updateProfile)
  .put(validateUpdateProfile, updateProfile)
  .delete(deleteProfile);

// Add Link
router.post("/addLink", validateAddUpdateLink, addLink);
// Update Link
router.put("/updateLink/:linkId", validateAddUpdateLink, updateLink);
// Delete Link
router.delete("/deleteLink/:linkId", validateDeleteLink, deleteLink);

export default router;
