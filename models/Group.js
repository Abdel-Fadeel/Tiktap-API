import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
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

const Group = mongoose.model("Group", GroupSchema);

export default Group;
