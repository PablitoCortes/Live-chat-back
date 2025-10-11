import { Response } from "express";
import {
  getUserProfileService,
  deleteUserAccountService,
  updateAccountService,
} from "../services/userService";

import { AuthRequest } from "../middlewares/authUser";
import { sendResponse, sendError } from "../utils/apiResponse";

export const getUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;

  try {
    if (!userId) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    const user = await getUserProfileService(userId);

    if (!user) {
      sendError(res, 404, "User not found");
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    sendResponse(
      res,
      200,
      "User profile retrieved successfully",
      userWithoutPassword
    );
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 500, "Error fetching user profile", error.message);
    } else {
      sendError(res, 500, "Error fetching user profile");
    }
  }
};

export const deleteUserAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    await deleteUserAccountService(userId);

    res.clearCookie("token", {
      sameSite: "strict",
      expires: new Date(0),
    });

    sendResponse(res, 200, "User account deleted successfully");
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 500, "Error deleting user account", error.message);
    } else {
      sendError(res, 500, "Error deleting user account");
    }
  }
};

export const updateAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const { email, name } = req.body;

  if (!userId) {
    sendError(res, 401, "Unauthorized");
    return;
  }

  if (!email || !name) {
    sendError(res, 400, "Email and name are required");
    return;
  }

  try {
    const updateData = { email, name };
    const updatedUser = await updateAccountService(userId, updateData);

    if (!updatedUser) {
      sendError(res, 404, "User not found");
      return;
    }

    const { password: _, ...userWithoutPassword } = updatedUser.toObject();
    sendResponse(res, 200, "Account updated successfully", userWithoutPassword);
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 500, "Error updating account", error.message);
    } else {
      sendError(res, 500, "Error updating account");
    }
  }
};
