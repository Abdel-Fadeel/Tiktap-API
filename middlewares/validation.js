import { validationResult } from "express-validator";
import { BadRequestError, UnauthorizedError } from "../errors/customErrors.js";

export const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg);
        // Not Authorized
        if (errorMessages[0].startsWith("Not authorized"))
          throw new UnauthorizedError(errorMessages.join(" "));
        // Bad Request (default)
        throw new BadRequestError(errorMessages.join(", "));
      }
      next();
    },
  ];
};
