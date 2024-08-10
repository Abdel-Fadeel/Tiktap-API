import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.BAD_REQUEST;
  const message = err.message || "Something went wrong, please try again.";
  res.status(statusCode).json({ message, status: false });
};

export default errorHandlerMiddleware;
