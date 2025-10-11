import { Router } from "express";
import {
  createConversation,
  getUserConversations,
  deleteUserConversation,
  getConversation
} from "../controllers/conversationController";
import { checkExistingConversation } from "../middlewares/checkExistingConversation";
import { checkParticipantsExists } from "../middlewares/checkParticipantsExists";
import { authUser } from "../middlewares/authUser";

const conversationRouter = Router();

conversationRouter.post(
  "/create",
  authUser,
  checkParticipantsExists,
  checkExistingConversation,
  createConversation
);

conversationRouter.get("/", authUser, getUserConversations);
conversationRouter.delete("/:conversationId", authUser, deleteUserConversation);

conversationRouter.get(
  "/:conversationId",
  authUser,
getConversation);

export default conversationRouter;
