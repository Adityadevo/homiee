"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import NavBar from "@/components/Navbar";

type Listing = {
  _id: string;
  listingType: "owner" | "buyer";
  propertyType: "room" | "flat";
  rent?: number;
  location?: string;
  description?: string;
  genderPref?: string;
  availableFrom?: string;
  moveInDate?: string;
  furnishing?: string;
  occupationType?: string;
  creator?: { 
    name?: string; 
    city?: string; 
    age?: number; 
    gender?: string;
  };
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiFetch<Listing>(`/listings/${id}`)
      .then(setListing)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRequest() {
    if (!listing) return;
    await apiFetch("/requests", {
      method: "POST",
      body: JSON.stringify({ listingId: listing._id })
    });
    router.replace("/requests");
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!listing) return <div className="p-6">Listing not found.</div>;

  const isOwnerListing = listing.listingType === "owner";

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 px-4 py-6 pb-24">
      <div className="mx-auto max-w-md">
        <Link href="/home" className="text-gray-600 hover:text-gray-900 mb-4 inline-block">
          ← Back to Feed
        </Link>

        <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-xl">
          {/* Badge */}
          <div className="flex justify-between items-start mb-4">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              isOwnerListing
                ? "bg-purple-100 text-purple-700 border border-purple-300"
                : "bg-pink-100 text-pink-700 border border-pink-300"
            }`}>
              {isOwnerListing ? "🏠 Owner Listing" : "🔍 Buyer Requirement"}
            </span>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-bold border border-gray-300">
              {listing.propertyType}
            </span>
          </div>

          {/* Rent */}
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {listing.rent ? `₹${listing.rent}/month` : "Negotiable"}
          </h1>

          {/* Location */}
          <div className="text-xl font-bold mb-4 text-gray-800">
            📍 {listing.location}
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
            <h3 className="font-bold text-sm text-gray-600 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Gender Preference</div>
              <div className="font-bold text-gray-800 capitalize">
                {listing.genderPref || "Any"}
              </div>
            </div>

            {isOwnerListing ? (
              <>
                {listing.furnishing && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Furnishing</div>
                    <div className="font-bold text-gray-800 capitalize">
                      {listing.furnishing}
                    </div>
                  </div>
                )}
                {listing.availableFrom && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Available From</div>
                    <div className="font-bold text-gray-800">
                      {new Date(listing.availableFrom).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {listing.moveInDate && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Move In Date</div>
                    <div className="font-bold text-gray-800">
                      {new Date(listing.moveInDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {listing.occupationType && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Occupation</div>
                    <div className="font-bold text-gray-800 capitalize">
                      {listing.occupationType}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Creator Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
            <h3 className="font-bold text-sm text-gray-600 mb-2">Posted By</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-xl text-white font-bold">
                {listing.creator?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-gray-800">{listing.creator?.name}</div>
                <div className="text-sm text-gray-600">
                  {listing.creator?.age && `${listing.creator.age}y`}
                  {listing.creator?.gender && ` • ${listing.creator.gender}`}
                  {listing.creator?.city && ` • ${listing.creator.city}`}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRequest}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {isOwnerListing ? "Contact Owner" : "Connect with Buyer"}
          </button>
        </div>
      </div>
      
      <NavBar />
    </div>
  );
}
