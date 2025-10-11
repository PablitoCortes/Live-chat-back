import { Request, Response, NextFunction } from "express";
import ConversationModel from "../models/ConversationModel";
import { AuthRequest } from "./authUser";

export const checkExistingConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
const userId = req.user?.userId;
const { contactId } = req.body;
  if (!userId || !contactId) {
    res.status(400).json({ message: "Invalid user or recipient data middleware" });
    return;
  }

  const participants = [userId, contactId];

  if (!Array.isArray(participants) || participants.length < 2) {
    res.status(400).json({ message: "Invalid participants data " });
    return;
  }

  try {
    const existingConversation = await ConversationModel.findOne({
      participants: { $all: participants },
    });

    if (existingConversation) {
      res.status(409).json({ message: "Conversation Already Exists" });
      return;
    }
    next();
  } catch (error) {
    console.error("Error finding if conversation exists:", error);
    res.status(500).json({ message: "Error finding if conversation exists" });
  }
};
