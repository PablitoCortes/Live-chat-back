import UserModel from "../models/UserModel";

export const getContactsService = async (userId: string) => {
    if (!userId) {
      throw new Error("User Error");
    }
    try {
      const user = await UserModel.findById(userId).populate('contacts', '_id name email');
      if(!user){
        throw new Error("user not found")
      }
      if(user.contacts.length<0){
        throw new Error("no contacts found")
      }
      return user?.contacts;
    } catch (error) {
      throw new Error("Error geting contacts ");
    }
  };
  
  export const addContactService = async (
    userId: string,
    contactEmail: string
  ) => {
    try {
      const currentUser = await UserModel.findById(userId);
      if (!currentUser) {
        throw new Error("acct Owner not found");
      }
  
      const contactToAdd = await UserModel.findOne({ email: contactEmail });
      if (!contactToAdd) {
        throw new Error("Contact not found");
      }
      if (currentUser.contacts?.includes(contactToAdd.id)) {
        throw new Error("Contact already exists");
      }
      currentUser.contacts = [...(currentUser.contacts || []), contactToAdd.id];
      await currentUser.save();
      return currentUser;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error adding contact in DB");
    }
  };
  
  export const deleteContactService = async (
    userId: string,
    contactId: string
  ) => {
    try {
      const foundUser = await UserModel.findById(userId);
      if (!foundUser) {
        throw new Error("User not found");
      }
  
      foundUser.contacts = foundUser.contacts.filter(
        (contact) => contact.toString() !== contactId
      );
      await foundUser.save();
      return foundUser.contacts;
    } catch (error) {
      throw new Error("Error deleting contact");
    }
  };