import mongoose from "mongoose";
import Contact from "./contactModel.js";
import Profile from "../profiles/profileModel.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/errors/customErrors.js";
import { IRequest, IResponse } from "@/types/index.js";
import path from "path";
import fs from "fs";

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
  const { fullName, phoneNumber, email, title, note, profileId } = req.body;
  const userId = req.user?.id;

  const profile = await Profile.findOne({ _id: profileId, userId });
  if (!profile) throw new BadRequestError("Profile not found!");

  const contact = await Contact.create({
    fullName,
    phoneNumber,
    email,
    title,
    note,
    profileId,
    userId,
    photo: req.file ? `/uploads/${req.file.filename}` : undefined,
  });

  // Add contact to profile's contacts array
  await Profile.findByIdAndUpdate(profileId, {
    $push: { contacts: contact._id }
  });

  res.status(StatusCodes.CREATED).json({ status: true, data: contact });
};

// Update a contact
export const updateContact = async (req: IRequest, res: IResponse) => {
  const { fullName, phoneNumber, email, title, note } = req.body;
  const userId = req.user?.id;
  const { id } = req.params;

  const contact = await Contact.findOne({ _id: id, userId });
  if (!contact) throw new BadRequestError("Contact not found!");

  // Update fields
  if (fullName) contact.fullName = fullName;
  if (phoneNumber) contact.phoneNumber = phoneNumber;
  if (email) contact.email = email;
  if (title) contact.title = title;
  if (note) contact.note = note;
  if (req.file) {
    // Delete old photo if exists
    if (contact.photo) {
      const oldPhotoPath = path.join(process.cwd(), contact.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }
    contact.photo = `/uploads/${req.file.filename}`;
  }

  await contact.save();

  res.status(StatusCodes.OK).json({ status: true, data: contact });
};

// Delete a contact (soft delete)
export const deleteContact = async (req: IRequest, res: IResponse) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const contact = await Contact.findOne({ _id: id, userId });
  if (!contact) throw new BadRequestError("Contact not found!");

  // Delete contact photo if exists
  if (contact.photo) {
    const photoPath = path.join(process.cwd(), contact.photo);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
  }

  await contact.deleteOne();

  res.status(StatusCodes.OK).json({ status: true, message: "Contact deleted successfully" });
}; 