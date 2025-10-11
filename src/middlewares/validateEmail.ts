import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse";

export const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  if (!email) {
    sendError(res, 400, "Email is required");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    sendError(res, 400, "Invalid email format");
    return;
  }

  next();
};
