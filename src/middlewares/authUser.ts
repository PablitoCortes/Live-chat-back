import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUserProfileService } from "../services/userService";
import { sendError } from "../utils/apiResponse";
import fileUpload from "express-fileupload";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
  files?:
    fileUpload.FileArray |null ;
}

export const verifyToken = async (token: string) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "tu-secreto-seguro"
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
    console.log("🔍 Auth middleware - Cookies:", req.cookies);
    console.log("🔍 Auth middleware - Headers:", req.headers.cookie);
    console.log (req.cookies["__Secure-next-auth.session-token"])
    let token = req.cookies.token || 
             req.cookies["next-auth.session-token"] || 
             req.cookies["__Secure-next-auth.session-token"];


    if (!token) {
      console.log("❌ No token found in cookies");
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

