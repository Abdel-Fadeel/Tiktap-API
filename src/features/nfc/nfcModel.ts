import mongoose, { Document } from "mongoose";

export interface INFC extends Document {
  cardId: string;
  status: "active" | "inactive";
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const nfcSchema = new mongoose.Schema(
  {
    cardId: {
      type: String,
      required: [true, "Card ID is required"],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
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

export default mongoose.model<INFC>("NFC", nfcSchema); 