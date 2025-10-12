import cloudinary from "../config/Cloudinary";
import { UploadedFile } from "express-fileupload";
import UserModel from "../models/UserModel";

export const uploadImageService = async (file: UploadedFile,userId:string): Promise<string> => {
  try {

    const user = await UserModel.findOne({_id: userId})

    if(!user){
      throw new Error("user not found")
    }

    if (!file.tempFilePath) {
      throw new Error("El archivo no tiene ruta temporal");
    }
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: `users/${userId}/avatar`,
      public_id: "avatar",
      overwrite: true,
      resource_type: "image",
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });

    user.avatarUrl= result.secure_url;
    await user.save()

    return result.secure_url;
  } catch (error) {
    console.error("❌ Error al subir imagen a Cloudinary:", error);
    throw new Error("No se pudo subir la imagen a Cloudinary");
  }
};
