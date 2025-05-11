import express from "express";
import { registerCard } from "./nfcController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { checkAdmin } from "../../middlewares/checkAdminMiddleware.js";

const router = express.Router();

// Protected endpoints
router.use(authMiddleware);
router.post("/register", checkAdmin, registerCard);

export default router; 