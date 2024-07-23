// controllers/contactController.js
import mongoose from "mongoose";
import Contact from "../models/contact.js";
import Profile from "../models/Profile.js";
import Group from "../models/Group.js";

// Get all contacts
export const getContacts = async (req, res) => {
  const { profileId } = req.query;
  const { userId } = req;
  try {
    const contacts = await Contact.find({ profileId, userId });
    res.status(200).json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Get a contact by ID
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
    });
    if (!contact) {
      return res.status(404).json({ msg: "Contact not found" });
    }
    res.status(200).json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Create a new contact
export const createContact = async (req, res) => {
  const { fullName, phoneNumber, note, email, title, profileId } = req.body;
  const { userId } = req;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const contact = new Contact({
      fullName,
      phoneNumber,
      note,
      email,
      title,
      profileId,
      userId,
    });

    await contact.save({ session });

    const profile = await Profile.findById(profileId).session(session);
    if (!profile) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Profile not found" });
    }

    profile.contacts.push(contact._id);
    await profile.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(contact);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Update a contact
export const updateContact = async (req, res) => {
  const { fullName, phoneNumber, note, email, title } = req.body;
  const { userId } = req;
  const updates = { fullName, phoneNumber, note, email, title };
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId },
      updates,
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ msg: "Contact not found" });
    }
    res.status(200).json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Delete a contact
export const deleteContact = async (req, res) => {
  const { userId } = req;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId,
    }).session(session);

    if (!contact) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Contact not found" });
    }

    const profile = await Profile.findById(contact.profileId).session(session);
    if (!profile) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Profile not found" });
    }

    profile.contacts.pull(contact._id);
    await profile.save({ session });

    // Remove the contact from all groups where it exists
    await Group.updateMany(
      { contacts: contact._id },
      { $pull: { contacts: contact._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ msg: "Contact deleted" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).send("Server error");
  }
};
