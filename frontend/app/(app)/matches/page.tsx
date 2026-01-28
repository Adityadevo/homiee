"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import NavBar from "@/components/Navbar";
import Link from "next/link";
import { MapPin, Phone, User, Briefcase, Heart, MessageCircle, HeartCrack } from "lucide-react";

export const dynamic = 'force-dynamic';

type Match = {
  matchedUser: {
    _id: string;
    name: string;
    age?: number;
    gender?: string;
    city?: string;
    area?: string;
    jobType?: string;
    profilePicture?: string;
    bio?: string;
    contactNumber?: string;
  };
  myListing?: {
    _id: string;
    propertyType?: string;
    rent?: number;
    location?: string;
    address?: string;
    accommodationType?: string;
    images?: string[];
  };
  theirListing?: {
    _id: string;
    propertyType?: string;
    rent?: number;
    location?: string;
    address?: string;
    accommodationType?: string;
    images?: string[];
  };
  matchedAt: string;
  chatId: string; // Request ID to use for chat
};

const getProfileImage = (user: Match["matchedUser"]) => {
  if (user.profilePicture && user.profilePicture.trim() !== "") return user.profilePicture;
  return "https://pixabay.com/get/gcc98e3544acdd60d2dbce22da5a8d96635dc4af2d465703464a169c3db289f7c0a3e5ce08c33c230e12ca42599157eb0.svg";
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Match[]>("/requests/matches")
      .then(setMatches)
      .catch((error: any) => {
        console.error("[Matches] Failed to load matches:", error);
        // Don't redirect on error, just show empty state
      })
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
    <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
           
            <h1 className="text-3xl font-bold text-gray-900">Your Matches</h1>
          </div>
          <p className="text-gray-600">People who are interested in your listing and you in theirs</p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4">
              <HeartCrack className="h-24 w-24 text-gray-300" />
            </div>
            <p className="text-gray-600 text-lg mb-2">No matches yet</p>
            <p className="text-gray-500 text-sm">
              When someone likes your listing and you like theirs, you'll see them here!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map((match, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
              >
                {/* Match Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 fill-white" />
                      <span className="font-semibold">It's a Match!</span>
                    </div>
                    <span className="text-sm text-white/80">
                      {new Date(match.matchedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* User Profile */}
                  <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full border-4 border-pink-200 overflow-hidden bg-white">
                        <img
                          src={getProfileImage(match.matchedUser)}
                          alt={match.matchedUser.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {match.matchedUser.name}
                      </h2>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>
                            {match.matchedUser.age && `${match.matchedUser.age} years`}
                            {match.matchedUser.gender && ` • ${match.matchedUser.gender}`}
                          </span>
                        </div>

                        {match.matchedUser.jobType && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            <span className="capitalize">{match.matchedUser.jobType}</span>
                          </div>
                        )}

                        {(match.matchedUser.city || match.matchedUser.area) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {match.matchedUser.area && `${match.matchedUser.area}, `}
                              {match.matchedUser.city}
                            </span>
                          </div>
                        )}

                        {/* Contact Number - Only shown for matches */}
                        {match.matchedUser.contactNumber && (
                          <div className="flex items-center gap-2 text-purple-600 font-semibold">
                            <Phone className="h-4 w-4" />
                            <a href={`tel:${match.matchedUser.contactNumber}`}>
                              {match.matchedUser.contactNumber}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Bio */}
                      {match.matchedUser.bio && (
                        <p className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          "{match.matchedUser.bio}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Listings Comparison */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Their Listing */}
                    {match.theirListing && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Their Listing
                        </h3>
                        
                        {match.theirListing.images && match.theirListing.images.length > 0 && (
                          <img
                            src={match.theirListing.images[0]}
                            alt="Their property"
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-semibold capitalize">
                              {match.theirListing.accommodationType === "whole-property" ? "Whole Property" : "Room"}
                            </span>
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded font-semibold capitalize">
                              {match.theirListing.propertyType}
                            </span>
                          </div>
                          
                          <div className="text-lg font-bold text-gray-900">
                            ₹{match.theirListing.rent}/month
                          </div>
                          
                          {(match.theirListing.address || match.theirListing.location) && (
                            <div className="flex items-start gap-1 text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">
                                {match.theirListing.address || match.theirListing.location}
                              </span>
                            </div>
                          )}
                          
                          <Link
                            href={`/listing/${match.theirListing._id}`}
                            className="inline-block mt-2 text-sm text-purple-600 hover:text-purple-700 font-semibold"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* My Listing */}
                    {match.myListing && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Your Listing
                        </h3>
                        
                        {match.myListing.images && match.myListing.images.length > 0 && (
                          <img
                            src={match.myListing.images[0]}
                            alt="Your property"
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-semibold capitalize">
                              {match.myListing.accommodationType === "whole-property" ? "Whole Property" : "Room"}
                            </span>
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded font-semibold capitalize">
                              {match.myListing.propertyType}
                            </span>
                          </div>
                          
                          <div className="text-lg font-bold text-gray-900">
                            ₹{match.myListing.rent}/month
                          </div>
                          
                          {(match.myListing.address || match.myListing.location) && (
                            <div className="flex items-start gap-1 text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">
                                {match.myListing.address || match.myListing.location}
                              </span>
                            </div>
                          )}
                          
                          <Link
                            href={`/listing/${match.myListing._id}`}
                            className="inline-block mt-2 text-sm text-purple-600 hover:text-purple-700 font-semibold"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {match.matchedUser.contactNumber && (
                      <a
                        href={`tel:${match.matchedUser.contactNumber}`}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold text-center shadow-md hover:shadow-lg transition-all"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </a>
                    )}
                    <Link
                      href={`/chat/${match.chatId}`}
                      className={`flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold text-center shadow-md hover:shadow-lg transition-all ${
                        !match.matchedUser.contactNumber ? 'col-span-2' : ''
                      }`}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <NavBar />
    </div>
  );
}
