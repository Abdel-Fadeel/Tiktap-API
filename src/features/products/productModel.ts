import mongoose from "mongoose";
import { IProduct } from "../../types/index.js";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model<IProduct>("Product", ProductSchema);

export default Product; 