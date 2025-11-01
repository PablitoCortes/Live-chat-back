import { Router } from "express";
import { validateEmail } from "../middlewares/validateEmail";
import { loginUser, LogoutUser, registerUser,recoverPassword} from "../controllers/authController";
import { checkExistingUser } from "../middlewares/checkExistingUser";

const authRouter = Router()


authRouter.post("/register", validateEmail, checkExistingUser, registerUser);
authRouter.post("/login", validateEmail, loginUser);
authRouter.post("/logout", LogoutUser);

authRouter.put("/recover-password", recoverPassword )

export default authRouter