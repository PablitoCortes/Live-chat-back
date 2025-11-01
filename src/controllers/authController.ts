import { Request, Response } from "express";
import { User } from "../interfaces/User";
import { sendResponse, sendError } from "../utils/apiResponse";
import {
  loginUserService,
  recoverPasswordService,
  registerUserService,
} from "../services/authService";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

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
      name,
      email,
      password,
      creationDate: new Date(),
    };

    const { newUser, token } = await registerUserService(userData);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 día
      path: "/",
    });

    sendResponse(res, 201, "User registered successfully", {
      user: newUser,
      token,
    });
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
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 día
      path: "/",
    });

    sendResponse(res, 200, "Login successful", {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 401, "Invalid credentials", error.message);
    } else {
      sendError(res, 401, "Invalid credentials");
    }
  }
};

export const recoverPassword= async(req:Request, res:Response):Promise<void>=>{
  const {newPassword,userEmail} = req.body
  if (!userEmail || !newPassword) {
    sendError(res, 400, "Email and password are required");
    return;
  }
  try{
    await recoverPasswordService(newPassword,userEmail)
    sendResponse(res,200, "Password changed successfully")
  }catch(error){
    if(error instanceof Error){
      sendError(res,500,"Error updating password", error.message)
    }else{
      sendError(res,500,"Error updating password")
    }
  }
}

export const LogoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? "none" : "lax",

    });

    sendResponse(res, 200, "Logout successful");
  } catch (error) {
    sendError(res, 500, "Error during logout");
  }
};
