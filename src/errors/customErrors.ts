import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  statusCode: number;
  name: string;

  constructor(message: string, statusCode: number, name: string) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, StatusCodes.NOT_FOUND, "NotFoundError");
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, StatusCodes.BAD_REQUEST, "BadRequestError");
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message: string) {
    super(message, StatusCodes.UNAUTHORIZED, "UnauthenticatedError");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, StatusCodes.FORBIDDEN, "UnauthorizedError");
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
} 