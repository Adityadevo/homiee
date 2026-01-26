import express from "express";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// POST /api/listings
router.post("/", authRequired, async (req, res) => {
  try {
    const listingData = {
      creator: req.user.id,
      listingType: req.body.listingType,
      
      // Property Address
      address: req.body.address,
      hideStreetName: req.body.hideStreetName || false,
      
      // Room Details
      accommodationType: req.body.accommodationType,
      propertyType: req.body.propertyType,
      
      // Financial Details
      rent: req.body.rent,
      securityDeposit: req.body.securityDeposit || 0,
      availableFrom: req.body.availableFrom,
      billsIncluded: req.body.billsIncluded || false,
      
      // Bills Breakdown
      billsBreakdown: req.body.billsBreakdown,
      
      // Additional Charges
      additionalCharges: req.body.additionalCharges,
      
      // Tenant Preferences
      dietaryPreference: req.body.dietaryPreference || ["any"],
      occupationType: req.body.occupationType || ["any"],
      amenities: req.body.amenities || [],
      
      // Media
      images: req.body.images || [],
      videos: req.body.videos || [],
      
      // Legacy fields for backward compatibility
      location: req.body.location || req.body.address,
      area: req.body.area,
      description: req.body.description,
      genderPref: req.body.genderPref,
      contactNumber: req.body.contactNumber,
      furnishing: req.body.furnishing,
      moveInDate: req.body.moveInDate,
      active: true
    };

    const listing = await Listing.create(listingData);
    res.json(listing);
  } catch (err) {
    console.error("Listing creation error:", err);
    res.status(500).json({ message: err.message || "Failed to create listing" });
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
    .populate("creator", "name city area age gender profilePicture contactNumber")
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
    const listing = await Listing.findById(req.params.id).populate("creator", "name city age gender profilePicture");
    if (!listing) return res.status(404).json({ message: "Not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});

export default router;
