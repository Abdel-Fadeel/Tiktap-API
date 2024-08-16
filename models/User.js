import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
  },
  facebookId: {
    type: String,
  },
  signupType: {
    type: String,
    enum: ["email/password", "google", "facebook"],
    default: "email/password",
  },
  profiles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
  ],
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
});

// Use a pre-save hook to hash the user's password before saving it to the database
UserSchema.pre("save", async function () {
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Define a method to compare a candidate password with the stored hashed password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);

export default User;
