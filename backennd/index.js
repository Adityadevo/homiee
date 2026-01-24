// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "./db.js";
import authRoutes from "./routes/auth.js";
import listingRoutes from "./routes/listings.js";
import requestRoutes from "./routes/requests.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/users", userRoutes);

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
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
