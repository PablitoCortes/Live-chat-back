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
      process.env.JWT_SECRET_KEY || "tu-secreto-seguro",
      { expiresIn: "24h" }
    );
    return { user, token };
  };

export const registerUserService = async (userData: User) => {
    const newUser = new UserModel(userData);

    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
      },
      process.env.JWT_SECRET_KEY || "tu-secreto-seguro",
      { expiresIn: "24h" })
    await newUser.save();

    return {newUser,token}
  };

export const googleLoginService = async (userData: { email: string; name: string; avatarUrl: string }) => {
 
  try{
    let user = await UserModel.findOne({ email: userData.email, isDeleted: false });
    
    // Si no existe, crear uno nuevo
    if (!user) {
      user = new UserModel({
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        provider: "google",
        password: null,
        isDeleted: false,
      });
      await user.save();
    }
    
    // Crear JWT firmado por tu backend
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "24h" }
    );
    return { user, token };

  }catch(error){
    console.error("❌ Error en googleLoginService:", error);
    throw new Error("Google login failed");

  }
  };