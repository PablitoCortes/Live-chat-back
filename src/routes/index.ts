import { Router } from "express";
import userRouter from "./userRouter";
import messageRouter from "./messageRouter";
import conversationRouter from "./conversationRouter";
import contactRouter from "./contactRouter";
import authRouter from "./authRouter"
import uploadRouter from "./uploadRouter";

const router = Router();

router.use("/users", userRouter);
router.use("/messages", messageRouter);
router.use("/conversations", conversationRouter);
router.use("/contacts",contactRouter)
router.use("/auth",authRouter)
router.use("/upload", uploadRouter);

export default router;
