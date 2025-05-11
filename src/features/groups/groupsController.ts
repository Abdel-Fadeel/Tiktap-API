import mongoose from "mongoose";
import Group from "./groupModel.js";
import Profile from "../profiles/profileModel.js";
import Contact from "../contacts/contactModel.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/errors/customErrors.js";
import { IRequest, IResponse } from "@/types/index.js";
import path from "path";
import fs from "fs";

// Get all groups
export const getGroups = async (req: IRequest, res: IResponse) => {
  const { profileId } = req.query;
  const userId = req.user?.id;

  if (!userId) throw new BadRequestError("User ID is required");
  if (!profileId) throw new BadRequestError("Profile ID is required");

  const groups = await Group.find({ profileId, userId, isActive: true })
    .populate("contacts")
    .sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({ 
    status: true, 
    data: groups 
  });
};

// Get a group by ID
export const getGroupById = async (req: IRequest, res: IResponse) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new BadRequestError("User ID is required");

  const group = await Group.findOne({ 
    _id: id, 
    userId, 
    isActive: true 
  }).populate("contacts");

  if (!group) throw new BadRequestError("Group not found");

  res.status(StatusCodes.OK).json({ 
    status: true, 
    data: group 
  });
};

// Create a new group
export const createGroup = async (req: IRequest, res: IResponse) => {
  const { name, description, profileId } = req.body;
  const userId = req.user?.id;

  const profile = await Profile.findOne({ _id: profileId, userId });
  if (!profile) throw new BadRequestError("Profile not found!");

  const group = await Group.create({
    name,
    description,
    profileId,
    userId,
    photo: req.file ? `/uploads/${req.file.filename}` : undefined,
  });

  // Add group to profile's groups array
  await Profile.findByIdAndUpdate(profileId, {
    $push: { groups: group._id }
  });

  res.status(StatusCodes.CREATED).json({ status: true, data: group });
};

// Update a group
export const updateGroup = async (req: IRequest, res: IResponse) => {
  const { name, description } = req.body;
  const userId = req.user?.id;
  const { id } = req.params;

  const group = await Group.findOne({ _id: id, userId });
  if (!group) throw new BadRequestError("Group not found!");

  // Update fields
  if (name) group.name = name;
  if (description) group.description = description;
  if (req.file) {
    // Delete old photo if exists
    if (group.photo) {
      const oldPhotoPath = path.join(process.cwd(), group.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }
    group.photo = `/uploads/${req.file.filename}`;
  }

  await group.save();

  res.status(StatusCodes.OK).json({ status: true, data: group });
};

// Delete a group (soft delete)
export const deleteGroup = async (req: IRequest, res: IResponse) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const group = await Group.findOne({ _id: id, userId });
  if (!group) throw new BadRequestError("Group not found!");

  // Delete group photo if exists
  if (group.photo) {
    const photoPath = path.join(process.cwd(), group.photo);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
  }

  await group.deleteOne();

  res.status(StatusCodes.OK).json({ status: true, message: "Group deleted successfully" });
};

// Add a contact to a group
export const addContactToGroup = async (req: IRequest, res: IResponse) => {
  const { groupId, contactId } = req.body;
  const userId = req.user?.id;

  if (!userId) throw new BadRequestError("User ID is required");
  if (!groupId) throw new BadRequestError("Group ID is required");
  if (!contactId) throw new BadRequestError("Contact ID is required");

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Check if group exists and belongs to user
    const group = await Group.findOne({ 
      _id: groupId, 
      userId, 
      isActive: true 
    }).session(session);

    if (!group) throw new BadRequestError("Group not found");

    // Check if contact exists and belongs to user
    const contact = await Contact.findOne({
      _id: contactId,
      userId,
      isActive: true
    }).session(session);

    if (!contact) throw new BadRequestError("Contact not found");

    // Check if contact is already in the group
    if (group.contacts.includes(contactId)) {
      throw new BadRequestError("Contact is already in the group");
    }

    // Add contact to group
    group.contacts.push(contactId);
    await group.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Contact added to group successfully",
      data: group,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// Remove a contact from a group
export const removeContactFromGroup = async (req: IRequest, res: IResponse) => {
  const { groupId, contactId } = req.body;
  const userId = req.user?.id;

  if (!userId) throw new BadRequestError("User ID is required");
  if (!groupId) throw new BadRequestError("Group ID is required");
  if (!contactId) throw new BadRequestError("Contact ID is required");

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Check if group exists and belongs to user
    const group = await Group.findOne({ 
      _id: groupId, 
      userId, 
      isActive: true 
    }).session(session);

    if (!group) throw new BadRequestError("Group not found");

    // Check if contact exists and belongs to user
    const contact = await Contact.findOne({
      _id: contactId,
      userId,
      isActive: true
    }).session(session);

    if (!contact) throw new BadRequestError("Contact not found");

    // Check if contact is in the group
    if (!group.contacts.includes(contactId)) {
      throw new BadRequestError("Contact is not in the group");
    }

    // Remove contact from group
    group.contacts = group.contacts.filter(
      id => id.toString() !== contactId
    );
    await group.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Contact removed from group successfully",
      data: group,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}; 