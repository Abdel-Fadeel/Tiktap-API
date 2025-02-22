import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/customErrors.js";

const handleCastErrorDB = (err) =>
  new BadRequestError(`Invalid ${err.path}: ${err.value}`);

const handleDuplicateFieldsDB = (err) => {
  return new BadRequestError(`${Object.keys(err.keyValue)[0]} already exists!`);
};

const handleValidationErrorDB = (err) => {
  const message = Object.values(err.errors)
    .map((error) => error.message)
    .join(". ");
  return new BadRequestError(`Invalid input data. ${message}.`);
};

const errorHandlerMiddleware = (err, req, res, next) => {
  let error = { ...err, name: err.name, message: err.message };
  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);

  const statusCode = error.statusCode || StatusCodes.BAD_REQUEST;
  const message = error.message || "Something went wrong, please try again.";
  res.status(statusCode).json({ message, status: false });
};

export default errorHandlerMiddleware;
