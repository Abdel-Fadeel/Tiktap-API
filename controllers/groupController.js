// controllers/groupController.js
import mongoose from "mongoose";
import Group from "../models/Group.js";
import Profile from "../models/Profile.js";

// Get all groups
export const getGroups = async (req, res) => {
  const { profileId } = req.query;
  const { userId } = req;
  try {
    const groups = await Group.find({ profileId, userId });
    res.status(200).json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Get a group by ID
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
    }).populate("contacts");
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }
    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
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
    if (!profile) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Profile not found" });
    }

    profile.groups.push(group._id);
    await profile.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(group);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Update a group
export const updateGroup = async (req, res) => {
  const { name, note, picture, contacts } = req.body;
  const { userId } = req;
  const updates = { name, note, picture, contacts };
  try {
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, userId },
      updates,
      { new: true }
    );
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }
    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
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

    if (!group) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Group not found" });
    }

    const profile = await Profile.findById(group.profileId).session(session);
    if (!profile) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Profile not found" });
    }

    profile.groups.pull(group._id);
    await profile.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ msg: "Group deleted" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).send("Server error");
  }
};
