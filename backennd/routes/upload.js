import express from "express";
import cloudinary from "../config/cloudinary.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// POST /api/upload/image
router.post("/image", authRequired, async (req, res) => {
  try {
    const { image } = req.body; // base64 image data
    
    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: "roommate-listings",
      resource_type: "auto",
      transformation: [
        { width: 1200, height: 900, crop: "limit" },
        { quality: "auto" }
      ]
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

// POST /api/upload/video
router.post("/video", authRequired, async (req, res) => {
  try {
    const { video } = req.body; // base64 video data
    
    if (!video) {
      return res.status(400).json({ message: "No video provided" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(video, {
      folder: "roommate-listings",
      resource_type: "video",
      transformation: [
        { width: 1280, height: 720, crop: "limit" },
        { quality: "auto" }
      ]
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).json({ message: "Video upload failed", error: error.message });
  }
});

// DELETE /api/upload/:publicId
router.delete("/:publicId", authRequired, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);
    
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
});

export default router;
