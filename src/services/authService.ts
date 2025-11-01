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

export const recoverPasswordService = async(email: string, newPassword:string)=>{
  const user = await UserModel.findOne({email: email})

  if(!user){
    throw new Error ("user not found")
  }
  user.password = newPassword

  await user.save()

  return {message: "password changed successfully"}
}