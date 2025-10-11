import { Response } from "express";
import {
  createMessageService,
  deleteMessageService,
  getConversationMessagesService,
} from "../services/messageService";
import { AuthRequest } from "../middlewares/authUser";
import { sendResponse, sendError } from "../utils/apiResponse";
import { send } from "node:process";
import { getConversation } from "./conversationController";

export const createMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const { receiver, content, conversationId } = req.body;

  if (!userId || !receiver || !content || !conversationId) {
    sendError(res, 400, "Receiver, content, and conversationId are required");
    return;
  }

  try {
    const localtime = new Date();
    const localOffset = localtime.getTimezoneOffset() * 60000;
    const timestamp = new Date(localtime.getTime() - localOffset);

    const messageData = {
      sender: userId,
      receiver,
      content,
      conversationId,
      timestamp,
    };
    const newMessage = await createMessageService(messageData);
    if (!newMessage) {
      sendError(res, 500, "Error creating message");
      return;
    }
    sendResponse(res, 201, "Message created successfully", newMessage);
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 500, "Error creating message", error.message);
    } else {
      sendError(res, 500, "Error creating message");
    }
  }
};

export const getConversationMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const { conversationId } = req.params

  if (!userId) {
    sendError(res, 401, "unauthorized")
    return
  }
  try {
    const convMessages = await getConversationMessagesService(conversationId)
    if (!convMessages) {
      sendError(res, 404, "no ConversationFound")
      return
    }
    sendResponse(res,201, "Messages retrieved",convMessages)                                                                              
  } catch (err) {
     if (err instanceof Error) {
      sendError(res, 500, "Error creating message", err.message);
    } else {
      sendError(res, 500, "Error creating message");
    }
  }

}

export const deleteMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const { messageId } = req.params;

  if (!messageId) {
    sendError(res, 400, "Message ID is required");
    return;
  }

  try {
    const messageToDelete = await deleteMessageService(messageId, userId as string);
    sendResponse(res, 200, "Message deleted successfully", messageToDelete);
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 500, "Error deleting message", error.message);
    } else {
      sendError(res, 500, "Error deleting message");
    }
  }
};
