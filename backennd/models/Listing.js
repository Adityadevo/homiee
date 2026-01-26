import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listingType: { 
      type: String, 
      enum: ["owner", "buyer"],
      required: true 
    },
    
    // Property Address
    address: { type: String, required: true },
    hideStreetName: { type: Boolean, default: false },
    
    // Room Details
    accommodationType: {
      type: String,
      enum: ["room", "whole-property"],
      required: true
    },
    propertyType: { 
      type: String, 
      enum: ["apartment", "condo", "house", "townhouse", "basement", "loft", "studio", "trailer"],
      required: true 
    },
    
    // Financial Details
    rent: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    availableFrom: { type: Date, required: true },
    billsIncluded: { type: Boolean, default: false },
    
    // Bills Breakdown (optional)
    billsBreakdown: {
      electricity: Number,
      maintenance: Number,
      wifi: Number,
      gas: Number,
      water: Number,
      other: [{
        name: String,
        amount: Number
      }]
    },
    
    // Additional Charges (optional)
    additionalCharges: {
      maid: Number,
      cook: Number,
      other: [{
        name: String,
        amount: Number
      }]
    },
    
    // Tenant Preferences
    dietaryPreference: {
      type: [String],
      enum: ["veg", "non-veg", "any"],
      default: ["any"]
    },
    occupationType: {
      type: [String],
      enum: ["working", "student", "any"],
      default: ["any"]
    },
    amenities: {
      type: [String],
      default: []
    },
    
    // Media
    images: {
      type: [String],
      default: []
    },
    videos: {
      type: [String],
      default: []
    },
    
    // Legacy fields for backward compatibility
    location: String,
    area: String,
    description: String,
    genderPref: { type: String, default: "any" },
    active: { type: Boolean, default: true },
    contactNumber: String,
    furnishing: String,
    moveInDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);
