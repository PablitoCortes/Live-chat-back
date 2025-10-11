import {Router } from "express";
import { authUser } from "../middlewares/authUser";
import { getContacts, addContact, deleteContact } from "../controllers/contactController";

const contactRouter = Router();


contactRouter.get("/", authUser, getContacts);
contactRouter.put("/add", authUser, addContact);
contactRouter.delete("/:contactId", authUser, deleteContact);

export default contactRouter;