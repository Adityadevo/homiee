"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import NavBar from "@/components/Navbar";

type Listing = {
  _id: string;
  listingType: "owner" | "buyer";
  propertyType: string;
  accommodationType?: string;
  rent: number;
  location: string;
  area?: string;
  address?: string;
  description: string;
  creator: { 
    _id: string;
    name: string; 
    city: string; 
    age?: number; 
    gender?: string;
    profilePicture?: string;
  };
  furnishing?: string;
  moveInDate?: string;
  availableFrom?: string;
  images?: string[];
};

type UserMode = "buyer" | "owner";

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<UserMode>("buyer");

  useEffect(() => {
    setLoading(true);
    apiFetch<Listing[]>(`/listings/feed?mode=${mode}`)
      .then((data) => {
        const validListings = data.filter(listing => listing.creator != null);
        setListings(validListings);
      })
      .catch((err) => console.error("Feed error:", err))
      .finally(() => setLoading(false));
  }, [mode]);

  const getProfileImage = (creator: Listing["creator"]) => {
    if (creator.profilePicture) return creator.profilePicture;
    if (creator.gender === "male") return "https://i.pravatar.cc/150?img=12";
    if (creator.gender === "female") return "https://i.pravatar.cc/150?img=47";
    return "https://i.pravatar.cc/150?img=1";
  };

  const getPropertyImage = (listing: Listing) => {
    if (listing.images && listing.images.length > 0) {
      return listing.images[0];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-2xl animate-pulse text-gray-700">Loading listings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 pt-6 pb-24 px-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Mode Selector */}
        <div className="bg-white rounded-2xl p-2 flex gap-2 mb-6 shadow-md border border-gray-200 max-w-xl mx-auto">
          <button
            onClick={() => setMode("buyer")}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              mode === "buyer"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                : "bg-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            🏠 Properties
          </button>
          <button
            onClick={() => setMode("owner")}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              mode === "owner"
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                : "bg-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            📋 Tenants
          </button>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            {mode === "buyer" ? "Available Properties" : "People Looking for Place"}
          </h1>
          <p className="text-gray-600">
            {mode === "buyer" 
              ? `${listings.length} owner${listings.length !== 1 ? 's' : ''} offering their place` 
              : `${listings.length} ${listings.length !== 1 ? 'people' : 'person'} looking for a place`}
          </p>
        </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <Link 
                key={listing._id}
                href={`/listing/${listing._id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all border border-gray-200 hover:border-purple-300 flex flex-col"
              >
                {/* Image Section */}
                <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden relative">
                  {mode === "buyer" ? (
                    // Show property images for "I Need a Place" (owner listings)
                    <>
                      {getPropertyImage(listing) ? (
                        <img 
                          src={getPropertyImage(listing)!} 
                          alt={listing.propertyType}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-7xl opacity-40">🏠</div>
                      )}
                      
                      {/* Owner Profile Picture Overlay */}
                      <div className="">
                       
                      </div>
                    </>
                  ) : (
                    // Show user profile pic for "I Have a Place" (buyer listings)
                    <>
                      {listing.creator.profilePicture ? (
                        <img 
                          src={listing.creator.profilePicture} 
                          alt={listing.creator.name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg">
                          {listing.creator.name[0].toUpperCase()}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 text-xs rounded-full font-bold shadow-md ${
                      listing.listingType === "owner"
                        ? "bg-purple-500 text-white"
                        : "bg-pink-500 text-white"
                    }`}>
                      {listing.propertyType}
                    </span>
                    {listing.accommodationType && (
                      <span className="px-3 py-1 text-xs rounded-full font-bold shadow-md bg-white text-gray-700">
                        {listing.accommodationType === "whole-property" ? "Whole Property" : "Room"}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Rent */}
                  <div className="text-2xl font-black mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {listing.rent ? `₹${listing.rent}/month` : "Negotiable"}
                  </div>
                  
                  {/* Location */}
                  <div className="text-sm font-bold text-gray-700 mb-2">
                    📍 {listing.address || `${listing.area ? listing.area + ', ' : ''}${listing.location}`}
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                    {listing.description}
                  </p>
                  
                  {/* Additional Info */}
                  {listing.furnishing && (
                    <div className="text-xs text-gray-500 mb-2">
                      🪑 {listing.furnishing}
                    </div>
                  )}
                  
                  {/* Creator Info */}
                  <div className="pt-3 border-t border-gray-200 flex items-center gap-2">
                    {listing.creator.profilePicture ? (
                      <img 
                        src={listing.creator.profilePicture}
                        alt={listing.creator.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-purple-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {listing.creator.name[0].toUpperCase()}
                      </div>
                    )}
                    <div className="text-xs text-gray-600 flex-1 min-w-0">
                      <div className="font-bold truncate">{listing.creator.name}</div>
                      <div className="truncate">
                        {listing.creator.age && `${listing.creator.age}y`}
                        {listing.creator.gender && ` • ${listing.creator.gender}`}
                      </div>
                    </div>
                  </div>
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
