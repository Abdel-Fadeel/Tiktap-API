import mongoose, { Document, Types } from "mongoose";
import { IUser } from "@/types/index.js";

export interface INfcCard extends Document {
  cardId: string;
  userId: Types.ObjectId;
  profileIds: Types.ObjectId[];
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const nfcCardSchema = new mongoose.Schema(
  {
    cardId: {
      type: String,
      required: [true, "Card ID is required"],
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    profileIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model<INfcCard>("NfcCard", nfcCardSchema); 