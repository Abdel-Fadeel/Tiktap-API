import { StatusCodes } from "http-status-codes";
import Product from "./productModel.js";
import { BadRequestError } from "@/errors/customErrors.js";
import { IRequest, IResponse } from "@/types/index.js";

// Get all products
export const getProducts = async (_: IRequest, res: IResponse) => {
  const products = await Product.find();
  res.status(StatusCodes.OK).json({ status: true, data: products });
};

// Get a product by ID
export const getProductById = async (req: IRequest, res: IResponse) => {
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
export const createProduct = async (req: IRequest, res: IResponse) => {
  const { name, image, price } = req.body;

  const product = await Product.create({
    name,
    image,
    price,
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: "Product created successfully",
    data: product,
  });
};

// Update a product
export const updateProduct = async (req: IRequest, res: IResponse) => {
  const { name, price } = req.body;

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    { name, price },
    {
      new: true,
    }
  );

  if (!product) throw new BadRequestError("Product not found!");

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Product updated successfully",
    data: product,
  });
};

// Delete a product
export const deleteProduct = async (req: IRequest, res: IResponse) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) throw new BadRequestError("Product not found!");

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: "Product deleted successfully" });
}; 