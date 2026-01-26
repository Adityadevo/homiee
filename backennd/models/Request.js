// backend/models/Request.js
import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  // Optional - only if request is for a specific listing
  listing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Listing"
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  // Snapshot of sender's profile at time of request (excluding phone number)
  senderProfile: {
    name: String,
    age: Number,
    gender: String,
    jobType: String,
    city: String,
    area: String,
    profilePicture: String,
    bio: String
  }
}, {
  timestamps: true
});

export default mongoose.model("Request", requestSchema);
