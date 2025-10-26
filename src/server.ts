import 'dotenv/config';
import { createServer } from "node:http";
import { app } from ".";
import { Server } from "socket.io";
import { CustomSocket } from "./types/types";
import { getUserConversationsService } from './services/conversationService';
import { UserConnection } from './interfaces/UserConnection';
import { createConversationService } from './services/conversationService';
import { authSocket } from './middlewares/authSocket';
import { createMessageService } from './services/messageService';
import ConversationModel from './models/ConversationModel';
import UserModel from './models/UserModel';



const PORT: number = parseInt(process.env.PORT || "3000");

const server = createServer(app);
const io = new Server(server, {
  cors: {
 origin: [
  "http://localhost:3000",
  "https://live-chat-front-xutz.onrender.com"
],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 10000,
});


io.engine.on("connection_error", (err) => {
  console.error("Error de conexión:", err);
});

io.use(authSocket);

const connectedUsers = new Map<string, UserConnection>();

io.on("connection", async (socket: CustomSocket) => {
  try {
    const userId = socket.user?.userId;

    if (!userId) {
      socket.disconnect();
      return;
    }
    connectedUsers.set(userId, {
      socketId: socket.id,
      status: 'online',
      lastSeen: new Date()
    }
    );
    io.emit("user connected", userId, socket.id);

    const userConversations = await getUserConversationsService(userId);

    userConversations?.forEach(conversation => {
      socket.join(conversation._id.toString());
    });

    socket.on("new conversation", async (data) => {
    const { participants } = data; 

    if (!participants.includes(userId)) {
      socket.emit("authError", {
      source: "newConversation",
      reason: "unauthorized",
      message: "You are not authorized to create this conversation",
    });
    return;
    }
    if (!Array.isArray(participants) || participants.length < 2) {
      socket.emit("newConversationError", {
      source: "newConversation",
      reason: "invalid_participants",
      message: "invalid participant data",
    });
    return;
    }

    const recipientId = participants.find((id: string) => id !== userId);
    const recipient = await UserModel.findById(recipientId);
    if (!recipient) {
      socket.emit("newConversationError", {
        source: "newConversation",
        reason: "user_not_found",
        message: "User no longer available",
      });
      return;
    }

    const existing = await ConversationModel.findOne({
      participants: { $all: participants },
    });

    if (existing) {
      socket.emit("newConversationError", {
        source: "newConversation",
        reason: "already_exists",
        message: "conversation already exist",
        conversationId: existing._id,
        conversation: existing
      });
      return;
    }
      const conversationData = {
        participants,
        creationDate: new Date()
      };

        const newConversation = await createConversationService(conversationData);

        if (!newConversation) {
          socket.emit("authError", {
          source: "newConversation",
          reason: "unauthorized",
          message: "Debes estar logueado para crear una conversación",
          });
          return;
        }

      socket.join(newConversation.id);
      
        participants.forEach((participantId: string) => {
          const participantSocket = connectedUsers.get(participantId);
          if (participantSocket) {
            io.to(participantSocket.socketId).emit("conversation created", {
              conversation: newConversation
            })
          }
        });
        socket.emit("conversation joined", {
          conversationId: newConversation._id,
          participants,
          newConversation
        });
      
    });
    
    socket.on("new message", async (message) => {
      try {
        const sender = socket.user?.userId;
        if (!sender || !message) {
          socket.emit("error", "missing data");
          return;
        }
        if (
          typeof message.content !== "string" ||
          typeof message.receiver !== "string" ||
          typeof message.conversationId !== "string" ||
          !message.timestamp
        ) {
          socket.emit("error", "invalid message format");
          return;
        }
        const newMessageData = {
          content: message.content,
          sender,
          receiver: message.receiver,
          conversationId: message.conversationId,
          timestamp: message.timestamp,
        };

        const newMessage = await createMessageService(newMessageData);
        if (!newMessage) {
          socket.emit("error", "Error creating message");
          return;
        }
        io.to(message.conversationId).emit("message created", newMessage);
        console.log(newMessage)

      } catch (err) {
        console.error("Error creating message", err);
        socket.emit("error", "Error creating message");
      }
    });


  }
  catch (err) { }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Error starting server:', err);
});


