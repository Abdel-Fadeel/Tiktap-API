import express from "express";
const router = express.Router();
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

router.route("/").get(getUsers);

router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

export default router;
