import express from "express";

export const usersRouter = express.Router();
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "./userController.js";

usersRouter.route("/").get(getUsers);

usersRouter.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);
