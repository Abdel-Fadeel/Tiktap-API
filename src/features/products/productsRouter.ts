import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./productsController.js";
import { validateCreateProduct, validateProductId, validateUpdateProduct, checkAdmin } from "./productValidators.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { upload } from "@/utils/uploadUtils.js";

const router = Router();

// Public routes (but require authentication)
router.get("/", authMiddleware, getProducts);
router.get("/:id", authMiddleware, validateProductId, getProductById);

// Admin only routes
router.post(
  "/",
  authMiddleware,
  checkAdmin,
  upload.single("image"),
  validateCreateProduct,
  createProduct
);

router.put(
  "/:id",
  authMiddleware,
  checkAdmin,
  upload.single("image"),
  validateProductId,
  validateUpdateProduct,
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  checkAdmin,
  validateProductId,
  deleteProduct
);

export default router; 