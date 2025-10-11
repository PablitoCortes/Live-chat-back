import { AuthRequest } from "../middlewares/authUser";
import { Response } from "express";
import { addContactService, deleteContactService, getContactsService } from "../services/contactService";
import { sendResponse, sendError } from "../utils/apiResponse";

export const getContacts = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.userId;
  
    if (!userId) {
      sendError(res, 401, "Unauthorized");
      return;
    }
  
    try {
      const contacts = await getContactsService(userId);
      if (!contacts || contacts.length === 0) {
        sendResponse(res, 200, "No contacts found", []);
        return;
      }
      sendResponse(res, 200, "Contacts fetched successfully", contacts);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, 500, "Error fetching contacts", error.message);
      } else {
        sendError(res, 500, "Error fetching contacts");
      }
    }
  };
  
  export const addContact = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { contactEmail } = req.body;
  
      if (!userId || !contactEmail) {
        sendError(res, 400, "User and contact information are required");
        return;
      }
      const addedContact = await addContactService(userId, contactEmail);
      sendResponse(res, 200, "Contact added successfully", addedContact);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Contact already exists") {
          sendError(res, 409, error.message);
        } else if (error.message === "Contact not found") {
          sendError(res, 404, error.message);
        } else if (error.message === "acct Owner not found") {
          sendError(res, 404, "User not found");
        } else {
          sendError(res, 500, "Error adding contact", error.message);
        }
      } else {
        sendError(res, 500, "Error adding contact");
      }
    }
  };
  
  
  export const deleteContact = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.userId;
    const { contactId } = req.params;
  
    if (!userId || !contactId) {
      sendError(res, 400, "Missing required data");
      return;
    }
  
    try {
      const userContacts = await getContactsService(userId);
      const contact = userContacts?.find(
        (contact) => contact.toString() === contactId
      );
  
      if (!contact) {
        sendError(res, 404, "Contact not found");
        return;
      }
  
      const newContactsList = await deleteContactService(userId, contactId);
      sendResponse(res, 200, "Contact deleted successfully", newContactsList);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, 500, "Error deleting contact", error.message);
      } else {
        sendError(res, 500, "Error deleting contact");
      }
    }
  };