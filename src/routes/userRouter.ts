import { Router } from "express";
import {
  getUserProfile,
  deleteUserAccount,
  updateAccount,
} from "../controllers/userController";
import { authUser } from "../middlewares/authUser";

const userRouter = Router();


userRouter.get("/profile", authUser, getUserProfile);
userRouter.put("/profile/update", authUser, updateAccount);
userRouter.delete("/delete", authUser, deleteUserAccount);



export default userRouter;
