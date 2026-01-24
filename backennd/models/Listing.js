import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listingType: { 
      type: String, 
      enum: ["owner", "buyer"], // owner = has flat/room, buyer = needs flat/room
      required: true 
    },
    propertyType: { 
      type: String, 
      enum: ["room", "flat"], 
      required: true 
    },
    rent: Number,
    location: String,
    description: String,
    genderPref: { type: String, default: "any" },
    active: { type: Boolean, default: true },
    // Additional fields for owner listings
    availableFrom: Date,
    furnishing: String, // "furnished", "semi-furnished", "unfurnished"
    // Additional fields for buyer listings
    moveInDate: Date,
    occupationType: String // "single", "shared"
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);
