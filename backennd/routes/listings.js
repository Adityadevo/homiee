import express from "express";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// POST /api/listings
router.post("/", authRequired, async (req, res) => {
  try {
    const { 
      listingType, 
      propertyType, 
      rent, 
      location, 
      description, 
      genderPref,
      availableFrom,
      furnishing,
      moveInDate,
      occupationType
    } = req.body;
    
    const listing = await Listing.create({
      creator: req.user.id,
      listingType,
      propertyType,
      rent,
      location,
      description,
      genderPref,
      availableFrom,
      furnishing,
      moveInDate,
      occupationType
    });
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create listing" });
  }
});

// GET /api/listings/feed?mode=buyer|owner
router.get("/feed", authRequired, async (req, res) => {
  try {
    const mode = req.query.mode; // "buyer" or "owner"
    
    // If user is in buyer mode, show owner listings (people offering flats)
    // If user is in owner mode, show buyer listings (people looking for flats)
    const showListingType = mode === "buyer" ? "owner" : "buyer";
    
    const listings = await Listing.find({ 
      creator: { $ne: req.user.id },
      listingType: showListingType,
      active: true 
    })
    .populate("creator", "name city age gender")
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed" });
  }
});

// GET /api/listings/my?type=owner|buyer
router.get("/my", authRequired, async (req, res) => {
  try {
    const typeFilter = req.query.type; // optional filter by listingType
    const query = { creator: req.user.id };
    
    if (typeFilter) {
      query.listingType = typeFilter;
    }
    
    const listings = await Listing.find(query)
    .sort({ createdAt: -1 })
    .lean();

    res.json(listings);
  } catch (err) {
    console.error("My listings error:", err);
    res.status(500).json({ message: "Failed to fetch my listings" });
  }
});

// GET /api/listings/:id
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("creator", "name city age gender");
    if (!listing) return res.status(404).json({ message: "Not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});

export default router;
