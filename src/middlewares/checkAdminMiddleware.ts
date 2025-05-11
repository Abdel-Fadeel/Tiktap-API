import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "@/errors/customErrors.js";
import { IRequest } from "@/types/index.js";

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as IRequest).user?.isAdmin) {
    throw new UnauthorizedError("Only admins can perform this action");
  }
  next();
}; 