import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/errors/customErrors.js";
import { IRequest, IResponse } from "@/types/index.js";
import Product from "./productModel.js";
import path from "path";
import fs from "fs";

// Get all products
export const getProducts = async (req: IRequest, res: IResponse) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ status: true, data: products });
};

// Get single product
export const getProductById = async (req: IRequest, res: IResponse) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  
  if (!product) {
    throw new BadRequestError("Product not found");
  }

  res.status(StatusCodes.OK).json({ status: true, data: product });
};

// Create new product (admin only)
export const createProduct = async (req: IRequest, res: IResponse) => {
  const { name, price, description } = req.body;
  const userId = req.user?.id;

  if (!req.file) {
    throw new BadRequestError("Product image is required");
  }

  const product = await Product.create({
    name,
    price: Number(price),
    description: description || undefined,
    image: `/uploads/${req.file.filename}`,
    createdBy: userId,
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: "Product created successfully",
    data: product,
  });
};

// Update product (admin only)
export const updateProduct = async (req: IRequest, res: IResponse) => {
  const { id } = req.params;
  const { name, price, description } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new BadRequestError("Product not found");
  }

  // Update fields
  if (name) product.name = name;
  if (price) product.price = Number(price);
  if (description !== undefined) product.description = description;
  
  // Handle image update if new file is uploaded
  if (req.file) {
    // Delete old image if exists
    if (product.image) {
      const oldImagePath = path.join(process.cwd(), product.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    product.image = `/uploads/${req.file.filename}`;
  }

  await product.save();

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Product updated successfully",
    data: product,
  });
};

// Delete product (admin only)
export const deleteProduct = async (req: IRequest, res: IResponse) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new BadRequestError("Product not found");
  }

  // Delete product image if exists
  if (product.image) {
    const imagePath = path.join(process.cwd(), product.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await product.deleteOne();

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Product deleted successfully",
  });
}; 