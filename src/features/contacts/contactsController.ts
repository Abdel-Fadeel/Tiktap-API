import mongoose from "mongoose";
import Contact from "./contactModel.js";
import Profile from "../profiles/profileModel.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/errors/customErrors.js";
import { IRequest, IResponse } from "@/types/index.js";

// Get all contacts
export const getContacts = async (req: IRequest, res: IResponse) => {
  const { profileId } = req.query;
  const { userId } = req;
  const contacts = await Contact.find({ profileId, userId });
  res.status(StatusCodes.OK).json({ status: true, data: contacts });
};

// Get a contact by ID
export const getContactById = async (req: IRequest, res: IResponse) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw new BadRequestError("Contact not found!");

  res.status(StatusCodes.OK).json({ status: true, data: contact });
};

// Create a new contact
export const createContact = async (req: IRequest, res: IResponse) => {
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
export const updateContact = async (req: IRequest, res: IResponse) => {
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
export const deleteContact = async (req: IRequest, res: IResponse) => {
  const { userId } = req;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId,
    }).session(session);

    if (!contact) throw new BadRequestError("Contact not found!");

    const profile = await Profile.findOne({ profileId: contact.profileId, userId }).session(session);
    if (profile) {
      profile.contacts = profile.contacts.filter(
        (contactId) => contactId.toString() !== contact._id.toString()
      );
      await profile.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Contact deleted successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}; 