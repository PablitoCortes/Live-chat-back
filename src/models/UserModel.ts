import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  creationDate: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  conversations: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  ],
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
