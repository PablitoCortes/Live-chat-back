import jwt from "jsonwebtoken";
const cookie = require("cookie");
import { CustomSocket, UserPayload } from "../types/types";

export const authSocket = (
  socket: CustomSocket,
  next: (err?: Error) => void
) => {

     console.log("cookie importado:", cookie);
  const cookiesHeader = socket.handshake.headers.cookie;

  if (!cookiesHeader) {
    return next(new Error("Authentication required: no cookie header found"));
  }

  const cookies = cookie.parse(cookiesHeader);
  const token = cookies.token;

  if (!token) {
    return next(new Error("Authentication required: token not found"));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tu-secreto-seguro"
    ) as UserPayload;

    socket.user = decoded;
    next();
  } catch (error) {
    console.error("Invalid token:", error);
    next(new Error("Invalid token"));
  }
};
