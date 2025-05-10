import mongoose from "mongoose";
import { IGroup } from "@/types/index.js";

const GroupSchema = new mongoose.Schema<IGroup>({
  name: {
    type: String,
    required: [true, "Group name is required"],
    trim: true,
    minlength: [2, "Group name must be at least 2 characters long"],
    maxlength: [50, "Group name cannot exceed 50 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  note: {
    type: String,
    trim: true,
  },
  picture: {
    type: String,
  },
  contacts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
    },
  ],
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
GroupSchema.index({ userId: 1, name: 1 }, { unique: true });

const Group = mongoose.model<IGroup>("Group", GroupSchema);

export default Group; 