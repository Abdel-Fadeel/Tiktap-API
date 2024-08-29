// controllers/contactController.js
import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import Profile from "../models/Profile.js";
import Group from "../models/Group.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/customErrors.js";

// Get all contacts
export const getContacts = async (req, res) => {
  const { profileId } = req.query;
  const { userId } = req;
  const contacts = await Contact.find({ profileId, userId });
  res.status(StatusCodes.OK).json({ status: true, data: contacts });
};

// Get a contact by ID
export const getContactById = async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw new BadRequestError("Contact not found!");

  res.status(StatusCodes.OK).json({ status: true, data: contact });
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

    const profile = await Profile.findOne({ profileId, userId }).session(
      session
    );
    if (!profile) throw new BadRequestError("Profile not found!");

    profile.contacts.push(contact._id);
    await profile.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Contact created successfully",
      data: contact,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// Update a contact
export const updateContact = async (req, res) => {
  const { fullName, phoneNumber, note, email, title } = req.body;
  const { userId } = req;
  const updates = { fullName, phoneNumber, note, email, title };
  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, userId },
    updates,
    { new: true }
  );
  if (!contact) throw new BadRequestError("Contact not found!");

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Contact updated successfully",
    data: contact,
  });
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

    if (!contact) throw new BadRequestError("Contact not found!");

    const profile = await Profile.findById(contact.profileId).session(session);
    if (!profile) throw new BadRequestError("Profile not found!");

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

    res
      .status(StatusCodes.OK)
      .json({ status: true, message: "Contact deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
