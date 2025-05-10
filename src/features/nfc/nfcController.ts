import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnauthenticatedError } from "@/errors/customErrors.js";
import { IRequest, IResponse } from "@/types/index.js";
import NfcCard from "./nfcModel.js";
import Profile from "../profiles/profileModel.js";

// Register a new NFC card
export const registerCard = async (req: IRequest, res: IResponse) => {
  const { cardId } = req.body;
  const userId = req.user?.id;

  if (!userId) throw new UnauthenticatedError("User not authenticated");

  // Check if card is already registered
  const existingCard = await NfcCard.findOne({ cardId });
  if (existingCard) {
    throw new BadRequestError("Card is already registered");
  }

  // Get all user's profiles
  const profiles = await Profile.find({ userId });
  if (!profiles.length) {
    throw new BadRequestError("User has no profiles");
  }

  const card = await NfcCard.create({
    cardId,
    userId,
    profileIds: profiles.map(profile => profile._id),
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: "Card registered successfully",
    data: card,
  });
};

// Handle NFC card scan
export const handleCardScan = async (req: IRequest, res: IResponse) => {
  const { cardId } = req.body;

  const card = await NfcCard.findOne({ cardId, isActive: true });
  if (!card) {
    throw new BadRequestError("Invalid or inactive card");
  }

  // Update last used timestamp
  card.lastUsed = new Date();
  await card.save();

  // Get all profiles
  const profiles = await Profile.find({ _id: { $in: card.profileIds } });
  if (!profiles.length) {
    throw new BadRequestError("No profiles found for this card");
  }

  // Return all profiles data
  res.status(StatusCodes.OK).json({
    status: true,
    message: "Profiles accessed successfully",
    data: {
      profiles,
    },
  });
};

// Get all cards for a user
export const getUserCards = async (req: IRequest, res: IResponse) => {
  const userId = req.user?.id;

  if (!userId) throw new UnauthenticatedError("User not authenticated");

  const cards = await NfcCard.find({ userId }).populate("profileIds");
  res.status(StatusCodes.OK).json({
    status: true,
    data: cards,
  });
};

// Deactivate a card
export const deactivateCard = async (req: IRequest, res: IResponse) => {
  const { cardId } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new UnauthenticatedError("User not authenticated");

  const card = await NfcCard.findOne({ cardId, userId });
  if (!card) {
    throw new BadRequestError("Card not found");
  }

  card.isActive = false;
  await card.save();

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Card deactivated successfully",
  });
};

// Update card's profiles to match current user profiles
export const updateCardProfiles = async (req: IRequest, res: IResponse) => {
  const { cardId } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new UnauthenticatedError("User not authenticated");

  // Get all current user profiles
  const profiles = await Profile.find({ userId });
  if (!profiles.length) {
    throw new BadRequestError("User has no profiles");
  }

  const card = await NfcCard.findOne({ cardId, userId });
  if (!card) {
    throw new BadRequestError("Card not found");
  }

  // Update card with all current user profiles
  card.profileIds = profiles.map(profile => profile._id);
  await card.save();

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Card profiles updated successfully with all current user profiles",
    data: {
      card,
      profiles
    },
  });
}; 