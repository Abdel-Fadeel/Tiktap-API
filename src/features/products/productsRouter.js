import express from "express";

export const productsRouter = express.Router();
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "./productController.js";

productsRouter.route("/").get(getProducts).post(createProduct);

productsRouter
  .route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);
