import { Router } from "express";
import { uploadAvatarController } from "../controllers/uploadController";
import { authUser } from "../middlewares/authUser";

const uploadRouter = Router();

uploadRouter.post("/avatar", authUser,uploadAvatarController);

export default uploadRouter;
