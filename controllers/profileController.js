import mongoose from "mongoose";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { validateURL } from "../utils/urlValidationUtils.js";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import { StatusCodes } from "http-status-codes";
// import { deleteImage, uploadImage } from "../utils/uploadImgUtils.js";

export const getProfiles = async (req, res) => {
  const profiles = await Profile.find({ userId: req.userId }).populate(
    "groups contacts"
  );
  res.status(StatusCodes.OK).json({ status: true, data: profiles });
};

export const getProfileById = async (req, res) => {
  const profile = await Profile.findById(req.params.id).populate(
    "groups contacts"
  );
  if (!profile) throw new BadRequestError("Profile not found!");

  res.status(StatusCodes.OK).json({ status: true, data: profile });
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
      throw new NotFoundError("User not found!");
    }

    user.profiles.push(profile._id);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Profile created successfully",
      data: profile,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
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

  const profile = await Profile.findById(req.params.id);
  if (!profile) throw new BadRequestError("Profile not found!");

  if (req.file) {
    if (profile.photo) {
      // await deleteImage(profile.photo);
    }
    // const newPhotoUrl = await uploadImage(req.file);
    // updates.photo = newPhotoUrl;
  }

  Object.assign(profile, updates);
  await profile.save();

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Profile updated successfully",
    data: profile,
  });
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
      throw new BadRequestError("Profile not found!");
    }

    // Find the user and update their profiles array
    const user = await User.findById(profile.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      throw new BadRequestError("User not found!");
    }

    user.profiles = user.profiles.filter(
      (profileId) => profileId.toString() !== req.params.id
    );
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res
      .status(StatusCodes.OK)
      .json({ status: true, message: "Profile deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// Add Link to Profile
export const addLink = async (req, res) => {
  const { type, url, profileId } = req.body;
  const { userId } = req;

  if (!validateURL(type, url)) throw new BadRequestError(`Invalid ${type} URL`);

  const profile = await Profile.findOne({
    userId,
    _id: profileId,
  });

  if (!profile) throw new BadRequestError("Profile not found!");

  profile.links.push({ type, url });

  await profile.save();

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: "Link added successfully", data: profile });
};

// Update Link in Profile
export const updateLink = async (req, res) => {
  const { type, url, profileId } = req.body;
  const { userId } = req;
  const { linkId } = req.params;

  if (!validateURL(type, url))
    throw new BadRequestError(`Invalid ${type} URL!`);

  const profile = await Profile.findOne({ userId, _id: profileId });
  if (!profile) throw new BadRequestError("Profile not found!");

  const link = profile.links.id(linkId);
  if (!link) throw new BadRequestError("Link not found!");

  link.type = type;
  link.url = url;

  await profile.save();

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Link updated successfully",
    data: profile,
  });
};

// Delete Link in Profile
export const deleteLink = async (req, res) => {
  const { profileId } = req.body;
  const { userId } = req;
  const { linkId } = req.params;

  const profile = await Profile.findOne({ userId, _id: profileId });
  if (!profile) throw new BadRequestError("Profile not found!");

  const linkIndex = profile.links.findIndex(
    (link) => link._id.toString() === linkId
  );
  if (linkIndex === -1) throw new BadRequestError("Link not found!");

  profile.links.splice(linkIndex, 1);

  await profile.save();

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Link deleted successfully",
    data: profile,
  });
};
