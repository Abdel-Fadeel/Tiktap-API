import mongoose, { Types } from "mongoose";
import { IProfile } from "../../types/index.js";

interface ILink {
  type: string;
  url: string;
  isEnabled: boolean;
}

const ProfileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: true,
  },
  title: {
    type: String,
  },
  photo: {
    type: String,
  },
  links: [
    {
      type: { type: String },
      url: { type: String },
      isEnabled: { type: Boolean, default: true },
    },
  ],
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  ],
  contacts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);

export default Profile; 