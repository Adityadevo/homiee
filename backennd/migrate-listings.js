// Migration script to fix old listings
import dotenv from "dotenv";
import mongoose from "mongoose";
import Listing from "./models/Listing.js";

dotenv.config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find all listings
    const listings = await Listing.find({});
    console.log(`📋 Found ${listings.length} listings`);

    let updated = 0;
    let deleted = 0;

    for (const listing of listings) {
      // Check if listing has creator field
      if (!listing.creator) {
        // If owner field exists (old schema), rename it
        if (listing.owner) {
          listing.creator = listing.owner;
          listing.owner = undefined;
          await listing.save();
          updated++;
          console.log(`✅ Updated listing ${listing._id} - moved owner to creator`);
        } else {
          // No creator and no owner - delete this listing
          await Listing.deleteOne({ _id: listing._id });
          deleted++;
          console.log(`❌ Deleted listing ${listing._id} - no creator`);
        }
      }

      // Check if propertyType exists, if not and type exists, migrate
      if (!listing.propertyType && listing.type) {
        listing.propertyType = listing.type;
        listing.type = undefined;
        await listing.save();
        updated++;
        console.log(`✅ Updated listing ${listing._id} - moved type to propertyType`);
      }

      // Add default listingType if missing
      if (!listing.listingType) {
        listing.listingType = "owner"; // Default to owner
        await listing.save();
        updated++;
        console.log(`✅ Updated listing ${listing._id} - added default listingType`);
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   Updated: ${updated} listings`);
    console.log(`   Deleted: ${deleted} invalid listings`);
    console.log(`   Total: ${listings.length} listings processed`);

    await mongoose.disconnect();
    console.log("\n✅ Migration complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
