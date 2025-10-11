import { Response, NextFunction } from "express";
import UserModel from "../models/UserModel";
import { AuthRequest } from "./authUser";

export const checkParticipantsExists = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.userId;
  const { contactId } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Usuario no autenticado" });
    return;
  }

  if (!contactId) {
    res.status(400).json({ message: "Se requiere ID del destinatario" });
    return;
  }

  try {
    const recipient = await UserModel.findById(contactId);
    if (!recipient) {
      res.status(404).json({ message: "The user is no longer available" });
      return;
    }
    next();
  } catch (error) {
    console.error('Middleware checkParticipants - error:', error);
    res.status(500).json({
      message: "Error validating participants",
    });
    return;
  }
};
