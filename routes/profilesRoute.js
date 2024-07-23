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

router.route("/").get(getProfiles).post(createProfile);

router
  .route("/:id")
  .get(getProfileById)
  // .put(upload.single("photo"), updateProfile)
  .put(updateProfile)
  .delete(deleteProfile);

// Add Link
router.post("/addLink", addLink);
// Update Link
router.put("/updateLink/:linkId", updateLink);
// Delete Link
router.delete("/deleteLink/:linkId", deleteLink);

export default router;
