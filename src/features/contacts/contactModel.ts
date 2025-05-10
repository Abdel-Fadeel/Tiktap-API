import mongoose from "mongoose";
import { IContact } from "@/types/index.js";

const ContactSchema = new mongoose.Schema<IContact>({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    minlength: [2, "Full name must be at least 2 characters long"],
    maxlength: [50, "Full name cannot exceed 50 characters"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
  },
  title: {
    type: String,
    trim: true,
  },
  note: {
    type: String,
    trim: true,
  },
  photo: {
    type: String,
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: [true, "Profile ID is required"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

// Add index for faster queries
ContactSchema.index({ userId: 1, email: 1 }, { unique: true });

const Contact = mongoose.model<IContact>("Contact", ContactSchema);

export default Contact; 