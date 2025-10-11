import { Socket } from "socket.io";

export interface UserPayload {
  userId: string;
  email: string;
}

export interface CustomSocket extends Socket {
  user?: UserPayload;
}
