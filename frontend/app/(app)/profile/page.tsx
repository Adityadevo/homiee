"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { getToken } from "@/lib/auth";
import NavBar from "@/components/Navbar";
import Link from "next/link";
// import NavBar from "@/components/NavBar";

type Listing = {
  _id: string;
  listingType: "owner" | "buyer";
  propertyType: string;
  rent: number;
  location: string;
  description: string;
};

export default function ProfilePage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "owner" | "buyer">("all");

  useEffect(() => {
    if (user) {
      apiFetch<Listing[]>("/listings/my").then(setMyListings);
    }
  }, [user]);

  const filteredListings = activeTab === "all" 
    ? myListings 
    : myListings.filter(l => l.listingType === activeTab);

  const handleLogout = () => {
    localStorage.removeItem("rommie_token");
    router.replace("/");
  };

  if (loading) return <div className="min-h-screen bg-white pt-20 p-6 text-gray-700">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 pt-8 pb-24">
      <div className="mx-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-8 text-center text-white shadow-lg">
          <div className="w-24 h-24 bg-white/30 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-black">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold">{user?.name}</h1>
          <p className="text-white/80">{user?.city}</p>
        </div>

        {/* My Published */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">My Listings ({myListings.length})</h2>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl p-1 flex gap-1 mb-4 shadow-md border border-gray-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All ({myListings.length})
            </button>
            <button
              onClick={() => setActiveTab("owner")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "owner"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Owner ({myListings.filter(l => l.listingType === "owner").length})
            </button>
            <button
              onClick={() => setActiveTab("buyer")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "buyer"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Buyer ({myListings.filter(l => l.listingType === "buyer").length})
            </button>
          </div>

          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-200">
              <div className="text-4xl mb-4 opacity-30">📝</div>
              <p className="text-gray-600">No listings published yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredListings.map((listing) => (
                <Link 
                  key={listing._id}
                  href={`/listing/${listing._id}`}
                  className={`block bg-white p-4 rounded-xl hover:shadow-lg transition-all border-l-4 shadow-md ${
                    listing.listingType === "owner"
                      ? "border-purple-500"
                      : "border-pink-500"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        listing.listingType === "owner"
                          ? "bg-purple-100 text-purple-700 border border-purple-300"
                          : "bg-pink-100 text-pink-700 border border-pink-300"
                      }`}>
                        {listing.listingType === "owner" ? "🏠 Owner" : "🔍 Buyer"}
                      </span>
                      <div className="font-bold text-xl mt-2 text-gray-800">₹{listing.rent}</div>
                      <div className="text-sm capitalize text-gray-600">{listing.propertyType}</div>
                    </div>
                    <span className="text-sm text-gray-600">📍 {listing.location}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {listing.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link 
            href="/create-listing" 
            className="block bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-xl text-center font-bold shadow-lg hover:shadow-xl transition-all"
          >
            + Create New Listing
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-black text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl hover:bg-gray-900 transition-all"
        >
          Logout
        </button>
      </div>
      
      <NavBar />
    </div>
  );
}
