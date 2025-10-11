import axios from "axios";
import { User } from "../interfaces/User";
import UserModel from "../models/UserModel";
import jwt from "jsonwebtoken"


export const loginUserService = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
  
    const user = await UserModel.findOne({ email, password, isDeleted: false })
  
  
    if (!user || user.password !== password) {
      throw new Error("Invalid credentials");
    }
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET || "tu-secreto-seguro",
      { expiresIn: "24h" }
    );
    return { user, token };
  };

export const registerUserService = async (userData: User) => {
    const newUser = new UserModel(userData);
    return await newUser.save();
  };

export const getGoogleAuthURL = (): string => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = new URLSearchParams({
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  });

  return `${rootUrl}?${options.toString()}`;
};

export const googleLoginService = async (code: string) => {
  const tokenResponse = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
      grant_type: "authorization_code",
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const { access_token } = tokenResponse.data;

  const userResponse = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const googleUser = userResponse.data;

  let user = await UserModel.findOne({ email: googleUser.email, isDeleted: false });

  if (!user) {
    user = new UserModel({
      name: googleUser.name,
      email: googleUser.email,
      picture: googleUser.picture,
      provider: "google",
      password: null,
      isDeleted: false,
    });

    await user.save();
  }
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET || "tu-secreto-seguro",
    { expiresIn: "24h" }
  );

  return { user, token };
};