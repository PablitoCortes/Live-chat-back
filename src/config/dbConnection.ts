import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb+srv://cjuan1597:4HAgGg6Xck8Rz8AO@live-chat.lkvnk0k.mongodb.net/";
    
    await mongoose.connect(mongoURI);
    
    console.log("Conexión a MongoDB exitosa.");
  } catch (error) {
    console.error("Error conectándose a MongoDB:", error);
    process.exit(1);
  }
};
