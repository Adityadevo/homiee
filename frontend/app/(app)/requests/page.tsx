"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import NavBar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { User, Briefcase, MapPin, Phone, MessageCircle, Eye, Inbox, X, Check } from "lucide-react";

export const dynamic = 'force-dynamic';

type RequestItem = {
  _id: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  listing: { 
    _id: string; 
    address?: string;
    rent?: number;
    propertyType?: string;
    accommodationType?: string;
    description?: string;
    images?: string[];
    listingType?: "owner" | "buyer";
  };
  sender?: { 
    _id: string;
    name?: string; 
    city?: string; 
    age?: number; 
    gender?: string;
    jobType?: string;
    profilePicture?: string;
    area?: string;
    bio?: string;
    contactNumber?: string;
  };
  receiver?: { 
    _id: string;
    name?: string; 
    city?: string; 
    age?: number; 
    gender?: string;
    jobType?: string;
    profilePicture?: string;
    area?: string;
    bio?: string;
    contactNumber?: string;
  };
  // Profile snapshot
  senderProfile?: {
    name?: string;
    age?: number;
    gender?: string;
    jobType?: string;
    city?: string;
    area?: string;
    profilePicture?: string;
    bio?: string;
  };
};

type ProfileData = RequestItem["sender"] | RequestItem["senderProfile"] | RequestItem["receiver"];

const getProfileImage = (profile: ProfileData) => {
  if (!profile) return "https://pixabay.com/get/gcc98e3544acdd60d2dbce22da5a8d96635dc4af2d465703464a169c3db289f7c0a3e5ce08c33c230e12ca42599157eb0.svg";
  if (profile.profilePicture && profile.profilePicture.trim() !== "") return profile.profilePicture;
  return "https://pixabay.com/get/gcc98e3544acdd60d2dbce22da5a8d96635dc4af2d465703464a169c3db289f7c0a3e5ce08c33c230e12ca42599157eb0.svg";
};

export default function RequestsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"incoming" | "sent">("incoming");
  const [incoming, setIncoming] = useState<RequestItem[]>([]);
  const [sent, setSent] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const [inc, snt] = await Promise.all([
        apiFetch<RequestItem[]>("/requests/incoming"),
        apiFetch<RequestItem[]>("/requests/sent")
      ]);
      setIncoming(inc);
      setSent(snt);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: "accepted" | "rejected") {
    try {
      await apiFetch(`/requests/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status })
      });
      
      // Reload requests to get updated contact info
      loadRequests();

      if (status === "accepted") {
        alert("✅ Request accepted! You can now see their contact number and start chatting.");
      }
    } catch (error: any) {
      alert(error.message || "Failed to update request");
    }
  }

  const list = tab === "incoming" ? incoming : sent;

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-xl animate-pulse text-gray-700">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
        
        <div className="flex rounded-lg bg-white p-1 shadow-sm border border-gray-200">
          <button
            className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${
              tab === "incoming" 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setTab("incoming")}
          >
            Incoming ({incoming.length})
          </button>
          <button
            className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${
              tab === "sent" 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setTab("sent")}
          >
            Sent ({sent.length})
          </button>
        </div>

        <div className="space-y-4">
          {list.map((r) => {
            const profileData = tab === "incoming" 
              ? (r.senderProfile || r.sender) 
              : r.receiver;
            const contactNumber = tab === "incoming" ? r.sender?.contactNumber : r.receiver?.contactNumber;
            const isOwnerListing = r.listing?.listingType === "owner";

            return (
              <div
                key={r._id}
                className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Status and Date Header */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 text-xs uppercase font-semibold rounded-full ${
                      r.status === "accepted" 
                        ? "bg-green-100 text-green-700"
                        : r.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Clear Section Labels */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <User className="h-5 w-5 text-purple-600" />
                      {tab === "incoming" ? "Request From:" : "Request To:"}
                    </h3>
                  </div>

                  {/* Profile Section */}
                  {profileData && (
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <div className="flex items-start gap-4">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-full border-2 border-purple-200 overflow-hidden bg-white">
                            <img
                              src={getProfileImage(profileData)}
                              alt={profileData?.name || "User"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {profileData.name || "Unknown"}
                          </h3>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>
                                {profileData.age && `${profileData.age} years`}
                                {profileData.gender && ` • ${profileData.gender}`}
                              </span>
                            </div>
                            
                            {profileData.jobType && (
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                <span className="capitalize">{profileData.jobType}</span>
                              </div>
                            )}
                            
                            {(profileData.city || profileData.area) && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {profileData.area && `${profileData.area}, `}
                                  {profileData.city}
                                </span>
                              </div>
                            )}

                            {/* Contact Number - Only shown for accepted requests */}
                            {r.status === "accepted" && contactNumber && (
                              <div className="flex items-center gap-2 text-purple-600 font-semibold mt-3 bg-purple-50 px-3 py-2 rounded-lg">
                                <Phone className="h-4 w-4" />
                                <a href={`tel:${contactNumber}`} className="hover:underline">
                                  {contactNumber}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Bio */}
                          {profileData.bio && (
                            <p className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                              "{profileData.bio}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Listing Info Label */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      {tab === "incoming" 
                        ? "Your Listing Details:" 
                        : "Property They're Offering:"}
                    </h3>
                  </div>

                  {/* Listing Info */}
                  {r.listing && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4 border border-purple-200">
                      <div className="flex items-start gap-3">
                        {/* Listing Image */}
                        {r.listing.images && r.listing.images.length > 0 && (
                          <img
                            src={r.listing.images[0]}
                            alt="Property"
                            className="w-24 h-24 rounded-lg object-cover border-2 border-white shadow-md"
                          />
                        )}
                        
                        {/* Listing Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded font-semibold capitalize">
                              {r.listing.accommodationType === "whole-property" ? "Whole Property" : "Room"}
                            </span>
                            <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded font-semibold capitalize">
                              {r.listing.propertyType}
                            </span>
                          </div>
                          
                          <div className="text-xl font-bold text-gray-900 mb-1">
                            ₹{r.listing.rent}/month
                          </div>
                          
                          {r.listing.address && (
                            <div className="flex items-start gap-1 text-sm text-gray-600 mb-2">
                              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{r.listing.address}</span>
                            </div>
                          )}

                          <button
                            onClick={() => router.push(`/listing/${r.listing._id}`)}
                            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-semibold"
                          >
                            <Eye className="h-4 w-4" />
                            View Full Details
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {tab === "incoming" && r.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateStatus(r._id, "rejected")}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => updateStatus(r._id, "accepted")}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </button>
                    </div>
                  )}

                  {/* Call and Chat Buttons for Accepted Requests */}
                  {r.status === "accepted" && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {contactNumber && (
                        <a
                          href={`tel:${contactNumber}`}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                          <Phone className="h-4 w-4" />
                          Call
                        </a>
                      )}
                      <button
                        onClick={() => router.push(`/chat/${r._id}`)}
                        className={`flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all ${
                          !contactNumber ? 'col-span-2' : ''
                        }`}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {list.length === 0 && (
            <div className="text-center py-20">
              <div className="flex justify-center mb-4">
                <Inbox className="h-24 w-24 text-gray-300" />
              </div>
              <p className="text-gray-600 text-lg">
                No {tab === "incoming" ? "incoming" : "sent"} requests yet
              </p>
            </div>
          )}
        </div>
      </div>
      <NavBar />
    </div>
  );
}
