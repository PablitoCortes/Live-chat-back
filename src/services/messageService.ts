import { Message } from "../interfaces/Message";
import MessageModel from "../models/MessageModel";
import ConversationModel from "../models/ConversationModel";
import { updateLastMessageService } from "./conversationService";

export const createMessageService = async (messageData: Message) => {
  try {
    const newMessage = new MessageModel(messageData);
    const savedMessage = await newMessage.save();

    await ConversationModel.findByIdAndUpdate(
      messageData.conversationId,
      { 
        $push: { messages: savedMessage._id }
      }
    );

    await updateLastMessageService(messageData.conversationId, savedMessage._id.toString());

    return savedMessage;
  } catch (error) {
    throw new Error(`Error creating message: ${error}`);
  }
};

export const deleteMessageService = async (
  messageId: string,
  userId: string
) => {
  try {
    const messageToDelete = await MessageModel.findOneAndDelete({
      sender: userId,
      _id: messageId,
    });
    if (!messageToDelete) {
      throw new Error("Message not found");
    }
    return messageToDelete;
  } catch (error) {
    throw new Error("Error deleting message");
  }
};

export const getConversationMessagesService = async (
  conversationId: string,
  page: number = 1,
  limit: number = 20
) => {
  if (!conversationId) {
    throw new Error("ConversationId missing");
  }

  try {
    const messages = await MessageModel.find({ conversationId })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalMessages = await MessageModel.countDocuments({ conversationId });
    const totalPages = Math.ceil(totalMessages / limit);

    return {
      messages,
      pagination: {
        currentPage: page,
        totalPages,
        totalMessages,
        hasMore: page < totalPages,
      },
    };
  } catch (err) {
    console.error(err);
    throw new Error("Error fetching messages");
  }
};
