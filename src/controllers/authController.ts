import { Request, Response } from "express";
import { User } from "../interfaces/User";
import { sendResponse, sendError } from "../utils/apiResponse";
import {
  googleLoginService,
  loginUserService,
  registerUserService,
} from "../services/authService";

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
    const isProduction = process.env.NODE_ENV === "production";

    const { newUser, token } = await registerUserService(userData);

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // ✅ true en prod
      sameSite: isProduction ? "none" : "lax", // ✅ importante si front y back están en dominios distintos
      maxAge: 24 * 60 * 60 * 7000,
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

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // ✅ true en prod
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 7000,
      domain: ".render.com",
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

export const googleAuth = async (req: Request, res: Response) => {
  try {
    console.log("📩 Datos enviados al servicio:", req.body);
    console.log("🔑 JWT_SECRET_KEY definido:", !!process.env.JWT_SECRET_KEY);
    console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
    
    const result = await googleLoginService(req.body);
    console.log("✅ Resultado del servicio:", { user: !!result?.user, token: !!result?.token });
    
    if (!result) {
      console.error("❌ Google login service returned no result");
      sendError(res, 500, "Google login service returned no result");
      return;
    }
    if (result.user && !result.token) {
      console.error("❌ Google login service returned no token");
      sendError(res, 500, "Google login service returned no token");
      return;
    }
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: isProduction, // ✅ true en prod
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 día
      path: "/",
    });

    sendResponse(res, 200, "Google login successful", {
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 500, "Error during Google login", error.message);
    } else {
      sendError(res, 500, "Error during Google login");
    }
  }
};

export const LogoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction, // ✅ true en prod
      sameSite: isProduction ? "none" : "lax",

    });

    sendResponse(res, 200, "Logout successful");
  } catch (error) {
    sendError(res, 500, "Error during logout");
  }
};
