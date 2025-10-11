import { Router } from "express";
import { createMessage, deleteMessage, getConversationMessages } from "../controllers/messageController";
import { authUser } from "../middlewares/authUser";

const messageRouter = Router();

messageRouter.post("/create", authUser, createMessage);

messageRouter.delete("/delete/:messageId", authUser, deleteMessage);

messageRouter.get("/:conversationId", authUser, getConversationMessages);

export default messageRouter;
