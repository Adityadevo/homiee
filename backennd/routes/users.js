// backend/routes/users.js
import express from "express";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// DELETE /api/users/me/listings/:id - Delete own listing
router.delete("/me/listings/:id", authRequired, async (req, res) => {
  try {
    const listing = await Listing.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });
    
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    
    res.json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
