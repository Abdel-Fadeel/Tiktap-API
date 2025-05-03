import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/customErrors.js";

const handleCastErrorDB = (err) =>
  new BadRequestError(`Invalid ${err.path}: ${err.value}`);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new BadRequestError(`${field} '${value}' already exists!`);
};

const handleValidationErrorDB = (err) => {
  const message = Object.values(err.errors)
    .map((error) => error.message)
    .join(". ");
  return new BadRequestError(`Invalid input data. ${message}`);
};

const handleJWTError = () =>
  new BadRequestError("Invalid token. Please log in again!");

const handleJWTExpiredError = () =>
  new BadRequestError("Your token has expired! Please log in again.");

const errorHandlerMiddleware = (err, req, res, next) => {
  let error = { ...err, name: err.name, message: err.message };
  
  // Handle specific error types
  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

  // Set appropriate status code
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  
  // Prepare error response
  const response = {
    status: false,
    message: error.message || "Something went wrong, please try again.",
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandlerMiddleware;
