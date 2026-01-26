// backend/routes/chat.js
import express from "express";
import Message from "../models/Message.js";
import Request from "../models/Request.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// GET /api/chat/:matchId - Get chat history for a match
router.get("/:matchId", authRequired, async (req, res) => {
  try {
    const { matchId } = req.params;
    
    // Verify user is part of this match
    const match = await Request.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    const userId = req.user.id;
    if (
      match.sender.toString() !== userId &&
      match.receiver.toString() !== userId
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // Get messages
    const messages = await Message.find({ matchId })
      .populate("sender", "name")
      .sort({ createdAt: 1 })
      .limit(500);
    
    // Mark messages as read
    await Message.updateMany(
      { 
        matchId, 
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/chat/:matchId - Send a message (for REST fallback)
router.post("/:matchId", authRequired, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }
    
    // Verify user is part of this match
    const match = await Request.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    const userId = req.user.id;
    if (
      match.sender.toString() !== userId &&
      match.receiver.toString() !== userId
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    const message = await Message.create({
      matchId,
      sender: userId,
      content: content.trim()
    });
    
    const populated = await Message.findById(message._id)
      .populate("sender", "name");
    
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/chat/:matchId/unread - Get unread count
router.get("/:matchId/unread", authRequired, async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;
    
    const count = await Message.countDocuments({
      matchId,
      sender: { $ne: userId },
      readBy: { $ne: userId }
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
