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
app.set("trust proxy", 1);

app.use(morgan("dev"));

// Configuración de CORS unificada
const allowedOrigins = [
  "http://localhost:3000",
  "https://live-chat-front-3xn3.onrender.com",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
];

console.log("🌐 Orígenes permitidos:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (como mobile apps o curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      console.log("❌ Origen no permitido:", origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200, // Para navegadores legacy
  })
);
// Middleware para manejar preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log("🔄 Handling OPTIONS request for:", req.path);
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cookie');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
    res.status(200).end();
    return;
  }
  next();
});

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
