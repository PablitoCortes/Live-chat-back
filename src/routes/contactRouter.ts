import {Router } from "express";
import { authUser } from "../middlewares/authUser";
import { getContacts, addContact, deleteContact,getAllContacts } from "../controllers/contactController";

const contactRouter = Router();


contactRouter.get("/", authUser, getContacts);
contactRouter.get("/all",authUser,getAllContacts)
contactRouter.put("/add", authUser, addContact);
contactRouter.delete("/:contactId", authUser, deleteContact);

export default contactRouter;