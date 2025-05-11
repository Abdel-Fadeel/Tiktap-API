import express from "express";
import { registerCard, getAllCards } from "./nfcController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { checkAdmin } from "@/middlewares/checkAdminMiddleware.js";

const router = express.Router();

// Protected endpoints
router.use(authMiddleware);
router.post("/register", checkAdmin, registerCard);
router.get("/", checkAdmin, getAllCards);

export default router; 