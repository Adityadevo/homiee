// backend/index.js
import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "./db.js";
import authRoutes from "./routes/auth.js";
import listingRoutes from "./routes/listings.js";
import requestRoutes from "./routes/requests.js";
import userRoutes from "./routes/users.js";
import chatRoutes from "./routes/chat.js";
import uploadRoutes from "./routes/upload.js";
import { initializeSocket } from "./socket.js";

dotenv.config();

const app = express();

// ✅ FIXED CORS (works for localhost + vercel + your custom frontend)
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    // allow localhost (dev)
    if (origin.startsWith("http://localhost")) {
      return callback(null, true);
    }

    // allow all vercel preview + prod URLs
    if (origin.includes("vercel.app")) {
      return callback(null, true);
    }

    // allow your main frontend from env
    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server and initialize Socket.io
const httpServer = createServer(app);
initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
