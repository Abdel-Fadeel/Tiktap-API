import mongoose from "mongoose";
import { IGroup } from "@/types/index.js";

const GroupSchema = new mongoose.Schema<IGroup>({
  name: {
    type: String,
    required: true,
  },
  note: {
    type: String,
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
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Group = mongoose.model<IGroup>("Group", GroupSchema);

export default Group; 