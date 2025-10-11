import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUserProfileService } from "../services/userService";
import { sendError } from "../utils/apiResponse";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const verifyToken = async (token: string) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tu-secreto-seguro"
    );
    return decoded as { userId: string; email: string };
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const authUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies.token;

    if (!token) {
      sendError(res, 401, "No token provided");
      return;
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      sendError(res, 401, "Invalid token format");
      return;
    }

    const user = await getUserProfileService(decoded.userId);
    if (!user) {
      sendError(res, 404, "User not found");
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 401, "Invalid token", error.message);
    } else {
      sendError(res, 401, "Invalid token");
    }
  }
};

