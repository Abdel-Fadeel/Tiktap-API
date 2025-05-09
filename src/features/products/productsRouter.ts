import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./productsController.js";
import { validateCreateProduct, validateProductId } from "@/validators/productValidators.js";
import { withValidationErrors } from "@/middlewares/validationMiddleware.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";

const router = Router();

router
  .route("/")
  .get(getProducts)
  .post(authMiddleware, validateCreateProduct, withValidationErrors(validateCreateProduct), createProduct);

router
  .route("/:id")
  .get(validateProductId, withValidationErrors(validateProductId), getProductById)
  .patch(authMiddleware, validateProductId, withValidationErrors(validateProductId), updateProduct)
  .delete(authMiddleware, validateProductId, withValidationErrors(validateProductId), deleteProduct);

export default router; 