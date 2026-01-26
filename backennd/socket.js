// backend/socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "./models/Message.js";
import Request from "./models/Request.js";

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentication token required"));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join a chat room for a specific match
    socket.on("join_chat", async (matchId) => {
      try {
        // Verify user is part of this match
        const match = await Request.findById(matchId);
        if (!match) {
          socket.emit("error", { message: "Match not found" });
          return;
        }
        
        const userId = socket.userId;
        if (
          match.sender.toString() !== userId &&
          match.receiver.toString() !== userId
        ) {
          socket.emit("error", { message: "Not authorized" });
          return;
        }
        
        socket.join(matchId);
        console.log(`User ${userId} joined chat room: ${matchId}`);
        
        // Mark messages as read when joining
        await Message.updateMany(
          { 
            matchId, 
            sender: { $ne: userId },
            readBy: { $ne: userId }
          },
          { $addToSet: { readBy: userId } }
        );
      } catch (error) {
        console.error("Error joining chat:", error);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    // Send a message
    socket.on("send_message", async ({ matchId, content }) => {
      try {
        if (!content || !content.trim()) {
          socket.emit("error", { message: "Message content required" });
          return;
        }
        
        // Verify user is part of this match
        const match = await Request.findById(matchId);
        if (!match) {
          socket.emit("error", { message: "Match not found" });
          return;
        }
        
        const userId = socket.userId;
        if (
          match.sender.toString() !== userId &&
          match.receiver.toString() !== userId
        ) {
          socket.emit("error", { message: "Not authorized" });
          return;
        }
        
        // Create message
        const message = await Message.create({
          matchId,
          sender: userId,
          content: content.trim()
        });
        
        const populated = await Message.findById(message._id)
          .populate("sender", "name");
        
        // Emit to all users in the chat room
        io.to(matchId).emit("new_message", populated);
        
        console.log(`Message sent in room ${matchId} by user ${userId}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // User is typing indicator
    socket.on("typing", ({ matchId, isTyping }) => {
      socket.to(matchId).emit("user_typing", { 
        userId: socket.userId, 
        isTyping 
      });
    });

    // Leave chat room
    socket.on("leave_chat", (matchId) => {
      socket.leave(matchId);
      console.log(`User ${socket.userId} left chat room: ${matchId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
    });
  });

  return io;
}
