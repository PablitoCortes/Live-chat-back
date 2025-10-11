export interface UserConnection{
  socketId: string;
  status: "online" | "offline";
  lastSeen?: Date;
}