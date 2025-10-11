import { Router } from "express";
import { validateEmail } from "../middlewares/validateEmail";
import { loginUser, LogoutUser, registerUser,googleAuthRedirect,googleAuthCallback} from "../controllers/authController";
import { checkExistingUser } from "../middlewares/checkExistingUser";

const authRouter = Router()


authRouter.post("/register", validateEmail, checkExistingUser, registerUser);
authRouter.post("/login", validateEmail, loginUser);
authRouter.post("/logout", LogoutUser);

authRouter.get("/google",googleAuthRedirect);
authRouter.get("/google/callback",googleAuthCallback)

export default authRouter