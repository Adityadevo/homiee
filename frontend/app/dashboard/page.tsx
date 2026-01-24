"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import NavBar from "@/components/Navbar";
// import NavBar from "@/components/NavBar";

type Listing = {
  _id: string;
  listingType: "owner" | "buyer";
  propertyType: string;
  rent: number;
  location: string;
  description: string;
  creator: { name: string; city: string; age?: number; gender?: string };
};

export default function Dashboard() {
  const { user } = useCurrentUser();
  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Listing[]>("/listings/feed"),
      apiFetch<Listing[]>("/listings/my")
    ]).then(([feed, my]) => {
      setListings(feed);
      setMyListings(my);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
      <div className="text-xl animate-pulse text-gray-700">Loading your dashboard...</div>
    </div>
  );

  const isBuyer = user?.role === "find";
  const title = isBuyer ? "Available properties" : "Buyer requirements";

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 pt-8 pb-24">
      <div className="mx-4 space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white text-center shadow-lg">
          <h1 className="text-2xl font-bold mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="opacity-90">
            {isBuyer ? "Browse properties" : "View buyer requests"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/create-listing">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-pink-500 transition-all">
              <div className="text-3xl mb-3">➕</div>
              <h3 className="font-bold text-lg mb-1 text-gray-800">New Listing</h3>
              <p className="text-sm text-gray-600">
                Post requirement or property
              </p>
            </div>
          </Link>
          <Link href="/requests">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-purple-500 transition-all">
              <div className="text-3xl mb-3">📨</div>
              <h3 className="font-bold text-lg mb-1 text-gray-800">Requests</h3>
              <p className="text-sm text-gray-600">Incoming & sent</p>
            </div>
          </Link>
        </div>

        {/* Available listings / Buyer requirements */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            {title} ({listings.length})
          </h2>
          {listings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-200">
              <div className="text-4xl mb-4 opacity-30">
                {isBuyer ? "🏠" : "🧑‍💼"}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">
                No {title.toLowerCase()} yet
              </h3>
              <p className="text-gray-600">
                {isBuyer ? "No properties available" : "No buyer requests"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <Link 
                  key={listing._id}
                  href={`/listing/${listing._id}`}
                  className="block bg-white p-5 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all border-l-4 border-pink-500 shadow-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-bold text-xl text-gray-800">₹{listing.rent}</div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full uppercase font-bold border border-purple-300">
                      {listing.propertyType}
                    </span>
                  </div>
                  <div className="text-lg mb-2 font-medium text-gray-800">{listing.location}</div>
                  <p className="text-gray-600 line-clamp-2 mb-3">
                    {listing.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>By {listing.creator.name}</span>
                    {listing.creator.age && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{listing.creator.age}y</span>
                      </>
                    )}
                    {listing.creator.city && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{listing.creator.city}</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My listings */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            My published ({myListings.length})
          </h2>
          {myListings.map((listing) => (
            <Link 
              key={listing._id}
              href={`/listing/${listing._id}`}
              className="block bg-white p-4 rounded-lg mb-3 hover:shadow-lg transition-all shadow-md border border-gray-200"
            >
              <div className="font-bold text-gray-800">₹{listing.rent} - {listing.location}</div>
              <p className="text-sm text-gray-600">{listing.description}</p>
            </Link>
          ))}
        </div>
      </div>
      
      <NavBar />
    </div>
  );
}
