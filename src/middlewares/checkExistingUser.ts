import { Request, Response, NextFunction } from "express";
import UserModel from "../models/UserModel";

export const checkExistingUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists" });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking user existence", error });
  }
};
