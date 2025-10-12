import { Response } from "express";
import { uploadImageService } from "../services/uploadService";
import { sendError, sendResponse } from "../utils/apiResponse";
import { AuthRequest } from "../middlewares/authUser";


export const uploadAvatarController = async (req: AuthRequest, res: Response):Promise<void> => {

const userId = req.user?.userId;
  
try {

    if(!userId){
			sendError(res,401,"Unauthrorized");
			return;
		}
    if (!req.files || !req.files.avatar) {
        sendError(res,400,"No image uploaded")
        return
    }
    const file = req.files.avatar as any;
    const imageUrl = await uploadImageService(file, userId);

    sendResponse(res,200, "image uploaded successfully", imageUrl)
  } catch (error) {
    if(error instanceof Error){
        sendError(res,500,"Error uploading Picture",error.message)
    }else{
        sendError(res,500, "Error uploading Picture")
    }
  }
};
