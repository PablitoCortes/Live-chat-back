import dotevents from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import router from "./routes/index";
import { connectDB } from "./config/dbConnection";
import fileUpload from "express-fileupload";

export const app = express();

dotevents.config();

app.use(morgan("dev"));

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://live-chat-front-xutz.onrender.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie"],
  })
);
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
    createParentPath: true,
  })
);

app.use("/api", router);

connectDB();
