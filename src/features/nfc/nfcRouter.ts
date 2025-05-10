import express from "express";
import {
  registerCard,
  handleCardScan,
  getUserCards,
  deactivateCard,
  updateCardProfiles,
} from "./nfcController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";

const router = express.Router();

// Public endpoint for card scanning
router.post("/scan", handleCardScan);

// Protected endpoints
router.use(authMiddleware);
router.post("/register", registerCard);
router.get("/cards", getUserCards);
router.delete("/cards/:cardId", deactivateCard);
router.put("/cards/:cardId/profiles", updateCardProfiles);

export default router; 