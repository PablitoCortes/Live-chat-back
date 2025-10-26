import { Router } from "express";
import { validateEmail } from "../middlewares/validateEmail";
import { loginUser, LogoutUser, registerUser,googleAuth} from "../controllers/authController";
import { checkExistingUser } from "../middlewares/checkExistingUser";

const authRouter = Router()


authRouter.post("/register", validateEmail, checkExistingUser, registerUser);
authRouter.post("/login", validateEmail, loginUser);
authRouter.post("/logout", LogoutUser);

authRouter.post("/google-login",googleAuth);

export default authRouter