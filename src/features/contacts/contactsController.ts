import mongoose from "mongoose";
import Contact from "./contactModel.js";
import Profile from "../profiles/profileModel.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/errors/customErrors.js";
import { IRequest, IResponse } from "@/types/index.js";

// Get all contacts
export const getContacts = async (req: IRequest, res: IResponse) => {
  const { profileId } = req.query;
  const userId = req.user?.id;

  if (!userId) throw new BadRequestError("User ID is required");
  if (!profileId) throw new BadRequestError("Profile ID is required");

  const contacts = await Contact.find({ 
    profileId, 
    userId, 
    isActive: true 
  }).sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({ 
    status: true, 
    data: contacts 
  });
};

// Get a contact by ID
export const getContactById = async (req: IRequest, res: IResponse) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new BadRequestError("User ID is required");

  const contact = await Contact.findOne({ 
    _id: id, 
    userId, 
    isActive: true 
  });

  if (!contact) throw new BadRequestError("Contact not found");

  res.status(StatusCodes.OK).json({ 
    status: true, 
    data: contact 
  });
};

// Create a new contact
export const createContact = async (req: IRequest, res: IResponse) => {
  const { fullName, phoneNumber, note, email, title, profileId } = req.body;
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

    // Check if contact with same email already exists for this profile
    const existingContact = await Contact.findOne({ 
      email, 
      profileId 
    }).session(session);

    if (existingContact) throw new BadRequestError("Contact with this email already exists in this profile");

    const contact = new Contact({
      fullName,
      phoneNumber,
      note,
      email,
      title,
      profileId,
      userId,
      isActive: true
    });

    await contact.save({ session });

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
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new BadRequestError("User ID is required");

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Check if contact exists and belongs to user
    const contact = await Contact.findOne({ 
      _id: id, 
      userId, 
      isActive: true 
    }).session(session);

    if (!contact) throw new BadRequestError("Contact not found");

    // If email is being updated, check for uniqueness within the same profile
    if (email && email !== contact.email) {
      const existingContact = await Contact.findOne({ 
        email, 
        profileId: contact.profileId,
        _id: { $ne: id }
      }).session(session);

      if (existingContact) throw new BadRequestError("Contact with this email already exists in this profile");
    }

    const updates: Partial<{
      fullName: string;
      phoneNumber: string;
      note: string;
      email: string;
      title: string;
    }> = { 
      fullName, 
      phoneNumber, 
      note, 
      email, 
      title 
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof typeof updates] === undefined) {
        delete updates[key as keyof typeof updates];
      }
    });

    const updatedContact = await Contact.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Contact updated successfully",
      data: updatedContact,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// Delete a contact (soft delete)
export const deleteContact = async (req: IRequest, res: IResponse) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new BadRequestError("User ID is required");

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const contact = await Contact.findOne({ 
      _id: id, 
      userId, 
      isActive: true 
    }).session(session);

    if (!contact) throw new BadRequestError("Contact not found");

    // Soft delete the contact
    contact.isActive = false;
    await contact.save({ session });

    // Remove contact from profile
    const profile = await Profile.findById(contact.profileId).session(session);
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