// controllers/groupController.js
import mongoose from "mongoose";
import Group from "../models/Group.js";
import Profile from "../models/Profile.js";
import Contact from "../models/Contact.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/customErrors.js";

// Get all groups
export const getGroups = async (req, res) => {
  const { profileId } = req.query;
  const { userId } = req;
  const groups = await Group.find({ profileId, userId });
  res.status(StatusCodes.OK).json({ status: true, data: groups });
};

// Get a group by ID
export const getGroupById = async (req, res) => {
  const group = await Group.findById(req.params.id).populate("contacts");
  if (!group) throw new BadRequestError("Group not found");
  res.status(StatusCodes.OK).json({ status: true, data: group });
};

// Create a new group
export const createGroup = async (req, res) => {
  const { name, note, picture, contacts, profileId } = req.body;
  const { userId } = req;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const group = new Group({
      name,
      note,
      picture,
      contacts,
      profileId,
      userId,
    });

    await group.save({ session });

    const profile = await Profile.findById(profileId).session(session);
    if (!profile) throw new BadRequestError("Profile not found");

    profile.groups.push(group._id);
    await profile.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Group created successfully",
      data: group,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// Update a group
export const updateGroup = async (req, res) => {
  const { name, note, picture, contacts } = req.body;
  const { userId } = req;
  const updates = { name, note, picture, contacts };

  const group = await Group.findOneAndUpdate(
    { _id: req.params.id, userId },
    updates,
    { new: true }
  );
  if (!group) throw new BadRequestError("Group not found!");

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: "Group updated successfully", data: group });
};

// Delete a group
export const deleteGroup = async (req, res) => {
  const { userId } = req;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const group = await Group.findOneAndDelete({
      _id: req.params.id,
      userId,
    }).session(session);

    if (!group) throw new BadRequestError("Group not found!");

    const profile = await Profile.findById(group.profileId).session(session);
    if (!profile) throw new BadRequestError("Profile not found");

    profile.groups.pull(group._id);
    await profile.save({ session });

    await session.commitTransaction();
    session.endSession();

    res
      .status(StatusCodes.OK)
      .json({ status: true, message: "Group deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Add contact to group
export const addContactToGroup = async (req, res) => {
  const { groupId, contactId } = req.body;
  const { userId } = req;

  const group = await Group.findOne({ _id: groupId, userId });
  if (!group) throw new BadRequestError("Group not found!");

  const contact = await Contact.findById(contactId);
  if (!contact) throw new BadRequestError("Contact not found!");

  if (group.contacts.includes(contact._id))
    throw new BadRequestError("Contact already in group");

  group.contacts.push(contact._id);
  await group.save();

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: "Contact added to group" });
};

// Remove contact from group
export const removeContactFromGroup = async (req, res) => {
  const { groupId, contactId } = req.body;
  const { userId } = req;

  const group = await Group.findOne({ _id: groupId, userId });
  if (!group) throw new BadRequestError("Group not found!");

  const contactIndex = group.contacts.indexOf(contactId);
  if (contactIndex === -1)
    throw new BadRequestError("Contact not found in group");

  group.contacts.splice(contactIndex, 1);
  await group.save();

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: "Contact removed from group" });
};
