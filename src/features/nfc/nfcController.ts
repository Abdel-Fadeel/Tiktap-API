import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/errors/customErrors.js";
import { IRequest, IResponse } from "@/types/index.js";
import NFC from "./nfcModel.js";

// Register a new NFC card
export const registerCard = async (req: IRequest, res: IResponse) => {
  const { cardId } = req.body;

  // Check if card ID already exists
  const existingCard = await NFC.findOne({ cardId });
  if (existingCard) {
    throw new BadRequestError("Card ID already registered");
  }

  // Create new NFC record with just the card ID
  const nfc = await NFC.create({
    cardId,
    status: "active"
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: "Card registered successfully",
    data: nfc,
  });
}; 