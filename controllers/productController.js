import { StatusCodes } from "http-status-codes";
import Product from "../models/Product.js";
import { BadRequestError } from "../errors/customErrors.js";

// Get all products
export const getProducts = async (req, res) => {
  const products = await Product.find();
  res.status(StatusCodes.OK).json({ status: true, data: products });
};

// Get a product by ID
export const getProductById = async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
  });

  if (!product) throw new BadRequestError("Product not found!");

  res.status(StatusCodes.OK).json({
    status: true,
    data: product,
  });
};

// Create a new product
export const createProduct = async (req, res) => {
  const { name, image, price } = req.body;

  const product = await Product.create({
    name,
    image,
    price,
  });

  res
    .status(StatusCodes.CREATED)
    .json({
      status: true,
      message: "Product created successfully",
      data: product,
    });
};

// Update a product
export const updateProduct = async (req, res) => {
  const { name, price } = req.body;

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    { name, price },
    {
      new: true,
    }
  );

  if (!product) throw new BadRequestError("Product not found!");

  res
    .status(StatusCodes.OK)
    .json({
      status: true,
      message: "Product updated successfully",
      data: product,
    });
};

// Delete a product
export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) throw new BadRequestError("Product not found!");

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: "Product deleted successfully" });
};
