import mongoose from "mongoose";
import Profile from "./profileModel.js";
import User from "../users/userModel.js";
import { BadRequestError, NotFoundError } from "@/errors/customErrors.js";
import { StatusCodes } from "http-status-codes";
import { IRequest, IResponse } from "@/types/index.js";
import { validateProfileExists } from "./profileValidators.js";
import path from "path";
import fs from "fs";
// import { deleteImage, uploadImage } from "../utils/uploadImgUtils.js";

export const getProfiles = async (req: IRequest, res: IResponse) => {
  const profiles = await Profile.find({ userId: req.user?.id }).populate(
    "groups contacts"
  );
  res.status(StatusCodes.OK).json({ status: true, data: profiles });
};

export const getProfileById = async (req: IRequest, res: IResponse) => {
  const profile = await Profile.findById(req.params.id).populate(
    "groups contacts"
  );
  if (!profile) throw new BadRequestError("Profile not found!");

  res.status(StatusCodes.OK).json({ status: true, data: profile });
};

export const createProfile = async (req: IRequest, res: IResponse) => {
  const { name, username, phoneNumber, title } = req.body;
  const userId = req.user?.id;
  const email = req.user?.email;

  const profile = await Profile.create({
    email,
    name,
    username,
    phoneNumber,
    title,
    userId,
  });

  // Add profile to user's profiles array
  await User.findByIdAndUpdate(userId, {
    $push: { profiles: profile._id }
  });

  res
    .status(StatusCodes.CREATED)
    .json({ status: true, message: "Profile created successfully", data: profile });
};

export const getProfile = async (req: IRequest, res: IResponse) => {
  const userId = req.user?.id;

  const profile = await Profile.findOne({ userId });
  if (!profile) throw new BadRequestError("Profile not found!");

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: "Profile fetched successfully", data: profile });
};

export const updateProfile = async (req: IRequest, res: IResponse) => {
  const { name, username, phoneNumber, title } = req.body;
  const email = req.user?.email;

  if (!email) throw new BadRequestError("User email not found");

  const profile = await validateProfileExists(req);
  
  // Update fields
  if (name) profile.name = name;
  if (username) profile.username = username;
  if (phoneNumber) profile.phoneNumber = phoneNumber;
  if (title) profile.title = title;
  if (req.file) {
    // Delete old photo if exists
    if (profile.photo) {
      const oldPhotoPath = path.join(process.cwd(), profile.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }
    profile.photo = `/uploads/${req.file.filename}`;
  }
  profile.email = email;

  await profile.save();

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: "Profile updated successfully", data: profile });
};

export const deleteProfile = async (req: IRequest, res: IResponse) => {
  const profile = await validateProfileExists(req);
  
  // Delete profile photo if exists
  if (profile.photo) {
    const photoPath = path.join(process.cwd(), profile.photo);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
  }

  await profile.deleteOne();

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: "Profile deleted successfully" });
};

// Add Link to Profile
export const addLink = async (req: IRequest, res: IResponse) => {
  const { type, url, isEnabled, profileId } = req.body;
  const userId = req.user?.id;

  const profile = await Profile.findOne({
    userId,
    _id: profileId,
  });

  if (!profile) throw new BadRequestError("Profile not found!");

  profile.links.push({ type, url, isEnabled: isEnabled ?? true });
  await profile.save();

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: "Link added successfully", data: profile });
};

// Update Link in Profile
export const updateLink = async (req: IRequest, res: IResponse) => {
  const { type, url, isEnabled, profileId } = req.body;
  const userId = req.user?.id;
  const { linkId } = req.params;

  const profile = await Profile.findOne({ userId, _id: profileId });
  if (!profile) throw new BadRequestError("Profile not found!");

  const link = profile.links.find(link => link._id?.toString() === linkId);
  if (!link) throw new BadRequestError("Link not found!");

  link.type = type;
  link.url = url;
  link.isEnabled = isEnabled;

  await profile.save();

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Link updated successfully",
    data: profile,
  });
};

// Delete Link in Profile
export const deleteLink = async (req: IRequest, res: IResponse) => {
  const { profileId } = req.body;
  const userId = req.user?.id;
  const { linkId } = req.params;

  const profile = await Profile.findOne({ userId, _id: profileId });
  if (!profile) throw new BadRequestError("Profile not found!");

  const linkIndex = profile.links.findIndex(
    (link) => link._id?.toString() === linkId
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