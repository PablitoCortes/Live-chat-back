import { Conversation } from "../interfaces/Conversation";
import ConversationModel from "../models/ConversationModel";
import { ObjectId } from "mongodb";
import MessageModel from "../models/MessageModel";
import UserModel from "../models/UserModel";

export const createConversationService = async (
  conversationData: Conversation
) => {
  if (!conversationData || !conversationData.participants) {
    throw new Error("Invalid conversation data");
  }
  if (conversationData.participants.length < 2) {
    throw new Error("At least two participants are required");
  }

  try {
    const newConversation = new ConversationModel(conversationData);
    const savedConversation = await newConversation.save();

    await UserModel.updateMany(
      { _id: { $in: conversationData.participants } },
      { $push: { conversations: savedConversation._id } }
    );

    return savedConversation;
  } catch (error) {
    throw new Error(`Error creating conversation: ${error}`);
  }
};

export const getUserConversationsService = async (userId: string) => {
  if (!userId) {
    throw new Error("Access denied");
  }
  try {
    const conversations = await ConversationModel.find({
      participants: userId,
    })
      .populate("participants", "name email")
      .populate("lastMessage", "content senderId createdAt")
      .sort({ "lastMessage.createdAt": -1, creationDate: -1 })
      .lean();

    if (!conversations || conversations.length === 0) {
      return [];
    }
    return conversations;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching conversations: ${error.message}`);
    }
  }
};

export const deleteUserConversationService = async (
  userId: string,
  conversationId: string
) => {
  if (!userId) {
    throw new Error("accessDenied");
  }
  if (!conversationId) {
    throw new Error("missing data");
  }

  try {
    const deletedConversation = await ConversationModel.findOneAndDelete({
      _id: conversationId,
      participants: userId,
    });

    if (!deletedConversation) {
      throw new Error("Conversation not found or access denied");
    }

    return deletedConversation;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error deleting conversation: ${error.message}`);
    }
  }
};

export const getConversationService = async (
  conversationId: string,
  userId: string,
) => {
  try {
    const conversation = await ConversationModel.findOne({
      _id: conversationId,
      participants: userId,
    })
      .populate('participants', 'name email username')
      .populate('lastMessage', 'content senderId createdAt timestamp')
      .lean();

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }
    return conversation
  } catch (error) {
    throw new Error(`Error fetching conversation: ${error}`);
  }
};

export const updateLastMessageService = async (
  conversationId: string,
  messageId: string
) => {
  try {
    await ConversationModel.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: messageId
      }
    );
  } catch (error) {
    throw new Error(`Error updating last message: ${error}`);
  }
};
