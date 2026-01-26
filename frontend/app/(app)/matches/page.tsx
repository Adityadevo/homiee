"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import NavBar from "@/components/Navbar";
import Link from "next/link";

type MatchItem = {
  _id: string;
  status: "pending" | "accepted" | "rejected";
  listing: { 
    _id: string; 
    rent?: number; 
    location?: string;
    propertyType?: string;
    listingType?: string;
    description?: string;
    creator?: { name?: string; city?: string; age?: number };
  };
  sender?: { name?: string; city?: string; age?: number; gender?: string; email?: string };
  receiver?: { name?: string; city?: string; age?: number; gender?: string; email?: string };
};

export default function MatchesPage() {
  const { user } = useCurrentUser();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<MatchItem[]>("/requests/matches")
      .then(setMatches)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-xl animate-pulse text-gray-700">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 px-4 py-8 pb-24">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          ❤️ Matches
        </h1>
        <p className="text-center text-gray-600">
          {matches.length} successful connection{matches.length !== 1 ? 's' : ''}
        </p>

        <div className="space-y-4">
          {matches.map((m) => {
            // Determine who the "other person" is
            const isISender = m.sender?.email === user?.email;
            const otherPerson = isISender ? m.receiver : m.sender;
            
            return (
              <div key={m._id} className="rounded-2xl bg-white p-6 shadow-lg border border-gray-200">
                {/* Match Badge */}
                <div className="text-center mb-4">
                  <div className="inline-block px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-bold text-sm shadow-md">
                    ✨ It&apos;s a Match!
                  </div>
                </div>

                {/* Listing Info */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4 border border-purple-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-black text-2xl text-gray-800">
                      ₹{m.listing.rent}/month
                    </div>
                    {m.listing.propertyType && (
                      <span className="px-3 py-1 bg-white text-purple-700 text-xs rounded-full font-bold border border-purple-300">
                        {m.listing.propertyType}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    📍 {m.listing.location}
                  </div>
                  {m.listing.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {m.listing.description}
                    </p>
                  )}
                </div>

                {/* Matched User Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                  <div className="text-xs text-gray-600 mb-2">Connected with</div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {otherPerson?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">
                        {otherPerson?.name || 'User'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {otherPerson?.age && `${otherPerson.age}y`}
                        {otherPerson?.gender && ` • ${otherPerson.gender}`}
                        {otherPerson?.city && ` • ${otherPerson.city}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href={`/listing/${m.listing._id}`}
                    className="text-center px-4 py-2 bg-white border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:border-purple-500 transition-all"
                  >
                    View Listing
                  </Link>
                  <Link 
                    href={`/chat/${m._id}`}
                    className="text-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Chat Now
                  </Link>
                </div>
              </div>
            );
          })}
          
          {matches.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💔</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">No matches yet</h2>
              <p className="text-gray-600 mb-6">
                Send interest to listings and wait for acceptance
              </p>
              <Link 
                href="/home"
                className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl"
              >
                Browse Listings
              </Link>
            </div>
          )}
        </div>
      </div>
      <NavBar />
    </div>
  );
}
