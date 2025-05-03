import express from "express";
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
} from "../../validators/productValidators.js";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "./productsController.js";

export const productsRouter = express.Router();

// Get all products
productsRouter.get("/", getProducts);

// Create new product
productsRouter.post("/", validateCreateProduct, createProduct);

// Get single product
productsRouter.get("/:id", validateProductId, getProductById);

// Update product
productsRouter.put("/:id", validateProductId, validateUpdateProduct, updateProduct);

// Delete product
productsRouter.delete("/:id", validateProductId, deleteProduct);
