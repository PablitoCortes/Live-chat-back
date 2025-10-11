import UserModel from "../models/UserModel";
import MessageModel from "../models/MessageModel";

export const getUserProfileService = async (userId: string) => {
  if (!userId) {
    throw new Error("missing Data");
  }
  try {
    const foundUser = await UserModel.findById(userId)
      .populate('contacts', '_id name email')
      .populate('conversations', '_id participants creationDate');
    
    const formatedUser = foundUser?.toObject()
    if(!formatedUser){
      throw new Error ("account not found")
    }
    return formatedUser;
  } catch (error) {
    throw new Error("error getting user from DB");
  }
};

export const deleteUserAccountService = async (
  userId: string
): Promise<void> => {
  try {
    const deletedUser = await UserModel.findOneAndDelete({ _id: userId });

    if (!deletedUser) {
      throw new Error("User not found");
    }

    await MessageModel.updateMany(
      { sender: userId },
      { isDeleted: true, deletedAt: new Date() }
    );
  } catch (error) {
    throw new Error("Error deleting user account");
  }
};

export const updateAccountService = async (
  userId: string,
  dataToupdate: Object
) => {
  if (!userId) {
    throw new Error("missing data");
  }
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      dataToupdate,
      {
        new: true,
        runValidatos: true,
      }
    );
    return updatedUser;
  } catch (error) {
    throw new Error("Error updating data");
  }
};
