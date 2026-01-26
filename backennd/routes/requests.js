// backend/routes/requests.js
import express from "express";
import Request from "../models/Request.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// POST /api/requests - Send interest to a listing
router.post("/", authRequired, async (req, res) => {
  try {
    const { listingId } = req.body;
    
    // Get the listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check if already sent
    const exists = await Request.findOne({
      sender: req.user.id,
      receiver: listing.creator,
      listing: listingId
    });
    
    if (exists) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Get sender's full profile (excluding password and contact number)
    const senderUser = await User.findById(req.user.id).select("-passwordHash -contactNumber");
    
    if (!senderUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create request with profile snapshot (NO listing info, just profile)
    const request = await Request.create({
      sender: req.user.id,
      receiver: listing.creator,
      listing: listingId, // Reference to which listing this request is for
      senderProfile: {
        name: senderUser.name,
        age: senderUser.age,
        gender: senderUser.gender,
        jobType: senderUser.jobType,
        city: senderUser.city,
        area: senderUser.area,
        profilePicture: senderUser.profilePicture,
        bio: senderUser.bio
      }
    });

    const populated = await Request.findById(request._id)
      .populate("listing", "propertyType rent address accommodationType images")
      .populate("sender", "name age gender city");

    res.json({ 
      request: populated
    });
  } catch (error) {
    console.error("Request creation error:", error);
    res.status(400).json({ message: error.message });
  }
});

// GET /api/requests/incoming - Incoming requests
router.get("/incoming", authRequired, async (req, res) => {
  try {
    const requests = await Request.find({ receiver: req.user.id })
      .populate("listing", "propertyType accommodationType rent address description images listingType")
      .populate({
        path: "sender",
        select: "name age gender city jobType profilePicture area bio"
      })
      .sort({ createdAt: -1 });
    
    // For accepted requests, include contact number
    const requestsWithContact = await Promise.all(
      requests.map(async (req) => {
        if (req.status === "accepted") {
          const senderWithContact = await User.findById(req.sender._id).select("contactNumber");
          return {
            ...req.toObject(),
            sender: {
              ...req.sender.toObject(),
              contactNumber: senderWithContact?.contactNumber
            }
          };
        }
        return req;
      })
    );
    
    res.json(requestsWithContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/requests/sent - Sent requests
router.get("/sent", authRequired, async (req, res) => {
  try {
    const requests = await Request.find({ sender: req.user.id })
      .populate("listing", "propertyType accommodationType rent address images listingType")
      .populate({
        path: "receiver",
        select: "name city age gender profilePicture"
      })
      .sort({ createdAt: -1 });
    
    // For accepted requests, include contact number
    const requestsWithContact = await Promise.all(
      requests.map(async (req) => {
        if (req.status === "accepted") {
          const receiverWithContact = await User.findById(req.receiver._id).select("contactNumber");
          return {
            ...req.toObject(),
            receiver: {
              ...req.receiver.toObject(),
              contactNumber: receiverWithContact?.contactNumber
            }
          };
        }
        return req;
      })
    );
    
    res.json(requestsWithContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/requests/:id/status - Accept/Reject
router.post("/:id/status", authRequired, async (req, res) => {
  try {
    const { status } = req.body; // "accepted" | "rejected"
    
    const request = await Request.findOneAndUpdate(
      { 
        _id: req.params.id, 
        receiver: req.user.id 
      },
      { status },
      { new: true }
    )
      .populate("listing", "propertyType accommodationType rent address")
      .populate("sender", "name age gender city contactNumber"); // Include contactNumber after acceptance
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    res.json({ 
      request
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/requests/matches - Mutual matches
// Match = UserA liked UserB's listing AND UserB liked UserA's listing
router.get("/matches", authRequired, async (req, res) => {
  try {
    // Find all my sent requests that are accepted (I requested their listings)
    const mySentAccepted = await Request.find({
      sender: req.user.id,
      status: "accepted"
    }).populate("listing receiver");

    // Find all my received requests that are accepted (They requested my listings)
    const myReceivedAccepted = await Request.find({
      receiver: req.user.id,
      status: "accepted"
    }).populate("listing sender");

    // Find matches: where we both have accepted requests
    const matches = [];
    
    for (const sentReq of mySentAccepted) {
      // Check if this person also sent me an accepted request
      const mutualMatch = myReceivedAccepted.find(
        recReq => recReq.sender._id.toString() === sentReq.receiver._id.toString()
      );
      
      if (mutualMatch) {
        // This is a match! Get full details with contact number
        const matchedUser = await User.findById(sentReq.receiver._id)
          .select("name age gender city area jobType profilePicture bio contactNumber");
        
        const theirListing = sentReq.listing; // The listing I requested
        const myListing = mutualMatch.listing; // The listing they requested

        matches.push({
          matchedUser,
          theirListing,
          myListing,
          matchedAt: sentReq.updatedAt > mutualMatch.updatedAt ? sentReq.updatedAt : mutualMatch.updatedAt,
          chatId: sentReq._id.toString() // Use the sent request ID for chat
        });
      }
    }

    // Sort by most recent
    matches.sort((a, b) => new Date(b.matchedAt) - new Date(a.matchedAt));

    res.json(matches);
  } catch (error) {
    console.error("Matches error:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/requests/:id - Get single request by ID (placed at end to avoid route conflicts)
router.get("/:id", authRequired, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("listing", "propertyType rent address location accommodationType images")
      .populate("sender", "name age gender city jobType profilePicture area bio email")
      .populate("receiver", "name age gender city jobType profilePicture area bio email");
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    // Verify user is part of this request
    const userId = req.user.id;
    if (
      request.sender._id.toString() !== userId &&
      request.receiver._id.toString() !== userId
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // Add contact numbers if accepted
    if (request.status === "accepted") {
      const senderWithContact = await User.findById(request.sender._id).select("contactNumber");
      const receiverWithContact = await User.findById(request.receiver._id).select("contactNumber");
      
      return res.json({
        ...request.toObject(),
        sender: {
          ...request.sender.toObject(),
          contactNumber: senderWithContact?.contactNumber
        },
        receiver: {
          ...request.receiver.toObject(),
          contactNumber: receiverWithContact?.contactNumber
        }
      });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
