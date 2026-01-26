// backend/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  { 
    timestamps: true 
  }
);

// Index for efficient querying
messageSchema.index({ matchId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
