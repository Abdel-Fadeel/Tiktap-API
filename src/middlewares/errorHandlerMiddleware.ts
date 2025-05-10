import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/customErrors.js";
import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  statusCode?: number;
  path?: string;
  value?: string;
  code?: number;
  keyValue?: Record<string, string>;
  errors?: Record<string, { message: string }>;
}

const handleCastErrorDB = (err: CustomError) =>
  new BadRequestError(`Invalid ${err.path}: ${err.value}`);

const handleDuplicateFieldsDB = (err: CustomError) => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = err.keyValue?.[field];
  return new BadRequestError(`${field} '${value}' already exists!`);
};

const handleValidationErrorDB = (err: CustomError) => {
  const message = Object.values(err.errors || {})
    .map((error) => error.message)
    .join(". ");
  return new BadRequestError(`Invalid input data. ${message}`);
};

const handleJWTError = () =>
  new BadRequestError("Invalid token. Please log in again!");

const handleJWTExpiredError = () =>
  new BadRequestError("Your token has expired! Please log in again.");

const errorHandlerMiddleware = (
  err: CustomError,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle MongoDB duplicate key error
  if (err.name === "MongoServerError" && err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const value = err.keyValue?.[field];
    res.status(StatusCodes.BAD_REQUEST).json({
      message: `${field} '${value}' already exists!`,
      status: false
    });
    return;
  }

  // Handle other errors
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Something went wrong, please try again.";

  res.status(statusCode).json({
    message,
    status: false
  });
};

export default errorHandlerMiddleware; 