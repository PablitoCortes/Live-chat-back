import { Message } from "./Message";

export interface Conversation {
  _id?: string;
  participants: string[];
  messages?: string[];
  lastMessage?: Message;
  creationDate: Date;
}
