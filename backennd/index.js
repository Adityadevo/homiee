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

// Middlewares
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins for development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // For production, you should specify exact origins
    callback(new Error('Not allowed by CORS'));
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
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Socket.io initialized`);
});
