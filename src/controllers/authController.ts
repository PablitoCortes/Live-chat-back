import {Request, Response} from "express"
import {User} from "../interfaces/User"
import { sendResponse, sendError } from "../utils/apiResponse";
import { getGoogleAuthURL, googleLoginService, loginUserService, registerUserService } from "../services/authService";

export const registerUser = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email, password, name } = req.body;
  
      if (!email || !password || !name) {
        sendError(res, 400, "Email, password and name are required");
        return;
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        sendError(res, 400, "Invalid email format");
        return;
      }
  
      const userData: User = {
        email,
        password,
        name,
        creationDate: new Date(),
      };
  
      const user = await registerUserService(userData);
      const { password: _, ...userWithoutPassword } = user.toObject();
  
      sendResponse(res, 201, "User registered successfully", userWithoutPassword);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, 500, "Error registering user", error.message);
      } else {
        sendError(res, 500, "Error registering user");
      }
    }
  };
  
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      sendError(res, 400, "Email and password are required");
      return;
    }

    const { user, token } = await loginUserService(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production" || true,
      maxAge: 24 * 60 * 60 * 1000,
      path: "/"
    });

    sendResponse(res, 200, "Login successful", {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token
    });
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 401, "Invalid credentials", error.message);
    } else {
      sendError(res, 401, "Invalid credentials");
    }
  }
};

export const googleAuthRedirect = async(req: Request, res: Response)=>{
  const url = getGoogleAuthURL();
  return res.redirect(url)
}

export const googleAuthCallback = async (req: Request, res: Response)=>{
  const {code} = req.query;

  if(!code) sendError(res, 400, "Missing authorization code")

  try{
    const {token} = await googleLoginService(code as string);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production" || true,
      maxAge: 24 * 60 * 60 * 1000,
      path: "/"
    });
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/success`)
  }catch(error){
    if (error instanceof Error) {
      sendError(res, 401, "Invalid credentials", error.message);
    } else {
      sendError(res, 401, "Invalid credentials");
    }
  }
}

export const LogoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.clearCookie("token", {
      sameSite: "strict",
      expires: new Date(0),
    });
    sendResponse(res, 200, "Logout completed successfully");
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 500, "Error finishing session", error.message);
    } else {
      sendError(res, 500, "Error finishing session");
    }
  }
};

  