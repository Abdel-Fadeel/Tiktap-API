import express from "express";
const router = express.Router();
import {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/profileController.js";

router.route("/").get(getProfiles).post(createProfile);

router
  .route("/:id")
  .get(getProfileById)
  // .put(upload.single("photo"), updateProfile)
  .put(updateProfile)
  .delete(deleteProfile);

export default router;
