"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import NavBar from "@/components/Navbar";

type Listing = {
  _id: string;
  listingType: "owner" | "buyer";
  propertyType: string;
  rent: number;
  location: string;
  description: string;
  creator: { name: string; city: string; age?: number; gender?: string };
  furnishing?: string;
  moveInDate?: string;
  availableFrom?: string;
};

type UserMode = "buyer" | "owner";

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<UserMode>("buyer"); // Default to buyer mode

  useEffect(() => {
    setLoading(true);
    apiFetch<Listing[]>(`/listings/feed?mode=${mode}`)
      .then((data) => {
        console.log("Listings loaded:", data);
        console.log("Mode:", mode);
        // Filter out listings with null creator
        const validListings = data.filter(listing => listing.creator != null);
        setListings(validListings);
      })
      .catch((err) => console.error("Feed error:", err))
      .finally(() => setLoading(false));
  }, [mode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-2xl animate-pulse text-gray-700">Loading listings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 pt-8 pb-24">
      <div className="px-4 space-y-4">
        {/* Mode Selector */}
        <div className="bg-white rounded-2xl p-2 flex gap-2 mb-6 shadow-md border border-gray-200">
          <button
            onClick={() => setMode("buyer")}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              mode === "buyer"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                : "bg-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            🏠 I Need a Place
          </button>
          <button
            onClick={() => setMode("owner")}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              mode === "owner"
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                : "bg-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            📋 I Have a Place
          </button>
        </div>

        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
          {mode === "buyer" ? "Available Properties" : "Looking for Place"}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {mode === "buyer" 
            ? `${listings.length} owners offering their place` 
            : `${listings.length} people looking for a place`}
        </p>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-30">
              {mode === "buyer" ? "🏠" : "🔍"}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">No listings yet</h2>
            <p className="text-gray-600 mb-6">
              {mode === "buyer" 
                ? "No properties available right now" 
                : "No one is looking for a place right now"}
            </p>
            <Link 
              href="/create-listing" 
              className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl"
            >
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <Link 
                key={listing._id}
                href={`/listing/${listing._id}`}
                className="block bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200 hover:border-pink-400"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="font-black text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {listing.rent ? `₹${listing.rent}` : "Negotiable"}
                  </div>
                  <span className={`px-4 py-2 text-sm rounded-full font-bold ${
                    listing.listingType === "owner"
                      ? "bg-purple-100 text-purple-700 border border-purple-300"
                      : "bg-pink-100 text-pink-700 border border-pink-300"
                  }`}>
                    {listing.propertyType} • {listing.listingType === "owner" ? "Available" : "Looking"}
                  </span>
                </div>

                {/* Location */}
                <div className="text-xl font-bold mb-3 text-gray-800">
                  📍 {listing.location}
                </div>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                  {listing.description}
                </p>

                {/* Additional Info */}
                {listing.furnishing && (
                  <div className="text-sm text-gray-500 mb-2">
                    🪑 {listing.furnishing}
                  </div>
                )}

                {/* Creator & Action */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  {listing.creator ? (
                    <div className="text-sm text-gray-600">
                      By {listing.creator.name}
                      {listing.creator.age && ` • ${listing.creator.age}y`}
                      {listing.creator.gender && ` • ${listing.creator.gender}`}
                      {listing.creator.city && (
                        <>
                          <span className="mx-2">•</span>
                          {listing.creator.city}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">
                      Posted by User
                    </div>
                  )}
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md">
                    View Details
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <NavBar />
    </div>
  );
}
