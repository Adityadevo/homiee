// backend/routes/requests.js
import express from "express";
import Request from "../models/Request.js";
import Listing from "../models/Listing.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// POST /api/requests - Send interest
router.post("/", authRequired, async (req, res) => {
  try {
    const { listingId } = req.body;
    
    // Check if already sent
    const exists = await Request.findOne({
      sender: req.user.id,
      listing: listingId
    });
    
    if (exists) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const request = await Request.create({
      sender: req.user.id,
      receiver: listing.creator,
      listing: listingId
    });

    const populated = await Request.findById(request._id)
      .populate("listing", "propertyType rent location listingType")
      .populate("sender", "name age gender city");
    
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/requests/incoming - Incoming requests (for owners)
router.get("/incoming", authRequired, async (req, res) => {
  try {
    const requests = await Request.find({ receiver: req.user.id })
      .populate("listing", "propertyType listingType rent location description furnishing")
      .populate("sender", "name age gender city jobType")
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/requests/sent - Sent requests
router.get("/sent", authRequired, async (req, res) => {
  try {
    const requests = await Request.find({ sender: req.user.id })
      .populate("listing", "propertyType listingType rent location")
      .populate("receiver", "name city age gender");
    
    res.json(requests);
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
      .populate("listing", "propertyType listingType rent location")
      .populate("sender", "name age gender city");
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/requests/matches - Mutual matches
// Shows when both users have shown interest in each other's listings
router.get("/matches", authRequired, async (req, res) => {
  try {
    // Find all accepted requests where current user is involved
    const myAcceptedRequests = await Request.find({
      $or: [
        { sender: req.user.id, status: "accepted" },
        { receiver: req.user.id, status: "accepted" }
      ]
    })
      .populate({
        path: "listing",
        select: "propertyType listingType rent location description creator",
        populate: {
          path: "creator",
          select: "name city age gender"
        }
      })
      .populate("sender", "name city age gender email")
      .populate("receiver", "name city age gender email")
      .sort({ updatedAt: -1 });
    
    res.json(myAcceptedRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
