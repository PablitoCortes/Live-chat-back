import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  title: String,
  creationDate: { type: Date, default: Date.now },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
});

const ConversationModel = mongoose.model("Conversation", conversationSchema);
export default ConversationModel;
