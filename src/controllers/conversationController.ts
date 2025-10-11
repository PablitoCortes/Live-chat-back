import { Response } from "express";
import { AuthRequest } from "../middlewares/authUser";
import {
  createConversationService,
  deleteUserConversationService,
  getUserConversationsService,
  getConversationService,
} from "../services/conversationService";
import { Conversation } from "../interfaces/Conversation";
import { sendResponse, sendError } from "../utils/apiResponse";

export const createConversation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const secondParty = req.body.contactId;

  if (!userId) {
    sendError(res, 401, "Access Denied");
    return;
  }

  const participants = [userId, secondParty];

  if (!participants || participants.length < 2) {
    sendError(res, 400, "Min two participants are needed");
    return;
  }

  try {
    const conversationData: Conversation = {
      participants,
      creationDate: new Date(),
    };
    const newConversation = await createConversationService(conversationData);
    sendResponse(
      res,
      201,
      "Conversation Created Successfully",
      newConversation
    );
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 500, "Error creating conversation", error.message);
    } else {
      sendError(res, 500, "Error creating conversation");
    }
  }
};

export const getUserConversations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    sendError(res, 401, "Access Denied");
    return;
  }
  try {
    const conversations = await getUserConversationsService(userId);
    if (!conversations || conversations.length === 0) {
      sendResponse(res, 200, "No conversations found", []);
      return;
    }
    sendResponse(res, 200, "Conversations fetched successfully", conversations);
    console.log(conversations)
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 500, "Error fetching conversations", error.message);
    } else {
      sendError(res, 500, "Error fetching conversations");
    }
  }
};

export const deleteUserConversation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const { conversationId } = req.params;

  if (!userId || !conversationId) {
    sendError(res, 400, "Missing required data");
    return;
  }

  try {
    const deletedConversation = await deleteUserConversationService(
      userId,
      conversationId
    );

    if (!deletedConversation) {
      sendError(res, 404, "Conversation not found");
      return;
    }

    sendResponse(
      res,
      200,
      "Conversation deleted successfully",
      deletedConversation
    );
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 500, "Error deleting conversation", error.message);
    } else {
      sendError(res, 500, "Error deleting conversation");
    }
  }
};

export const getConversation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const { conversationId } = req.params;
  if (!userId || !conversationId) {
    sendError(res, 400, "Missing required data");
    return;
  }

  try {
    const result = await getConversationService(
      conversationId,
      userId,
    );

    sendResponse(
      res,
      200,
      "Conversation and messages fetched successfully",
      result
    );
  } catch (error) {
    if (error instanceof Error) {
      sendError(
        res,
        500,
        "Error fetching conversation with messages",
        error.message
      );
    } else {
      sendError(res, 500, "Error fetching conversation with messages");
    }
  }
};
