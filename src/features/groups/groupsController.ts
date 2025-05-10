import mongoose from "mongoose";
import Group from "./groupModel.js";
import Profile from "../profiles/profileModel.js";
import Contact from "../contacts/contactModel.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/errors/customErrors.js";
import { IRequest, IResponse } from "@/types/index.js";

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
  const { name, description, note, picture, contacts, profileId } = req.body;
  const userId = req.user?.id;

  if (!userId) throw new BadRequestError("User ID is required");
  if (!profileId) throw new BadRequestError("Profile ID is required");

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Check if profile exists and belongs to user
    const profile = await Profile.findOne({ 
      _id: profileId, 
      userId 
    }).session(session);

    if (!profile) throw new BadRequestError("Profile not found");

    // Check if group name already exists for this user
    const existingGroup = await Group.findOne({ 
      name, 
      userId 
    }).session(session);

    if (existingGroup) throw new BadRequestError("Group with this name already exists");

    const group = new Group({
      name,
      description,
      note,
      picture,
      contacts,
      profileId,
      userId,
    });

    await group.save({ session });

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
export const updateGroup = async (req: IRequest, res: IResponse) => {
  const { name, description, note, picture, contacts } = req.body;
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new BadRequestError("User ID is required");

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Check if group exists and belongs to user
    const group = await Group.findOne({ 
      _id: id, 
      userId, 
      isActive: true 
    }).session(session);

    if (!group) throw new BadRequestError("Group not found");

    // If name is being updated, check for uniqueness
    if (name && name !== group.name) {
      const existingGroup = await Group.findOne({ 
        name, 
        userId,
        _id: { $ne: id }
      }).session(session);

      if (existingGroup) throw new BadRequestError("Group with this name already exists");
    }

    const updates: Partial<{
      name: string;
      description: string;
      note: string;
      picture: string;
      contacts: mongoose.Types.ObjectId[];
    }> = { 
      name, 
      description, 
      note, 
      picture, 
      contacts 
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof typeof updates] === undefined) {
        delete updates[key as keyof typeof updates];
      }
    });

    const updatedGroup = await Group.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Group updated successfully",
      data: updatedGroup,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// Delete a group (soft delete)
export const deleteGroup = async (req: IRequest, res: IResponse) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new BadRequestError("User ID is required");

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const group = await Group.findOne({ 
      _id: id, 
      userId, 
      isActive: true 
    }).session(session);

    if (!group) throw new BadRequestError("Group not found");

    // Soft delete the group
    group.isActive = false;
    await group.save({ session });

    // Remove group from profile
    const profile = await Profile.findById(group.profileId).session(session);
    if (profile) {
      profile.groups = profile.groups.filter(
        (groupId) => groupId.toString() !== group._id.toString()
      );
      await profile.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Group deleted successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
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