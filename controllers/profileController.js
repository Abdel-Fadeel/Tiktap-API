import mongoose from "mongoose";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
// import { deleteImage, uploadImage } from "../utils/uploadImgUtils.js";

export const getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate("groups contacts");
    res.status(200).json(profiles);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate(
      "groups contacts"
    );
    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

export const createProfile = async (req, res) => {
  const { name, username, phoneNumber, title } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Create new profile
    const profile = new Profile({
      name,
      username,
      phoneNumber,
      title,
      email: req.email,
      userId: req.userId, // Associate profile with user
    });

    await profile.save({ session });

    // Find the user by ID and update their profiles array
    const user = await User.findById(req.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "User not found" });
    }

    user.profiles.push(profile._id);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(profile);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).send("Server error");
  }
};

export const updateProfile = async (req, res) => {
  const { name, username, phoneNumber, title } = req.body;
  const updates = {
    name,
    username,
    phoneNumber,
    title,
  };

  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    if (req.file) {
      if (profile.photo) {
        // await deleteImage(profile.photo);
      }
      // const newPhotoUrl = await uploadImage(req.file);
      // updates.photo = newPhotoUrl;
    }

    Object.assign(profile, updates);
    await profile.save();

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

export const deleteProfile = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Find and delete the profile
    const profile = await Profile.findByIdAndDelete(req.params.id).session(
      session
    );
    if (!profile) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Profile not found" });
    }

    // Find the user and update their profiles array
    const user = await User.findById(profile.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "User not found" });
    }

    user.profiles = user.profiles.filter(
      (profileId) => profileId.toString() !== req.params.id
    );
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ msg: "Profile deleted" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).send("Server error");
  }
};
