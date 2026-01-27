"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import NavBar from "@/components/Navbar";
import { useCurrentUser } from "@/lib/useCurrentUser";
import {
  Image as ImageIcon,
  MapPin,
  Calendar,
  DollarSign,
  Home,
  Users,
  CheckCircle,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Listing = {
  _id: string;
  listingType: "owner" | "buyer";

  // Property Address
  address?: string;
  hideStreetName?: boolean;

  // Room Details
  accommodationType?: "room" | "whole-property";
  propertyType?: string;

  // Financial
  rent?: number;
  securityDeposit?: number;
  availableFrom?: string;
  billsIncluded?: boolean;

  // Bills Breakdown
  billsBreakdown?: {
    electricity?: number;
    maintenance?: number;
    wifi?: number;
    gas?: number;
    water?: number;
    other?: { name: string; amount: number }[];
  };

  // Additional Charges
  additionalCharges?: {
    maid?: number;
    cook?: number;
    other?: { name: string; amount: number }[];
  };

  // Preferences
  dietaryPreference?: string[];
  occupationType?: string[];
  amenities?: string[];

  // Media
  images?: string[];
  videos?: string[];

  // Legacy fields
  location?: string;
  description?: string;
  genderPref?: string;
  moveInDate?: string;
  furnishing?: string;

  creator?: {
    _id?: string;
    name?: string;
    city?: string;
    age?: number;
    gender?: string;
    profilePicture?: string;
  };
};

const getProfileImage = (creator?: Listing["creator"]) => {
  if (!creator)
    return "https://pixabay.com/get/gcc98e3544acdd60d2dbce22da5a8d96635dc4af2d465703464a169c3db289f7c0a3e5ce08c33c230e12ca42599157eb0.svg";
  if (creator.profilePicture && creator.profilePicture.trim() !== "")
    return creator.profilePicture;
  return "https://pixabay.com/get/gcc98e3544acdd60d2dbce22da5a8d96635dc4af2d465703464a169c3db289f7c0a3e5ce08c33c230e12ca42599157eb0.svg";
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useCurrentUser();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [requestSent, setRequestSent] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likingInProgress, setLikingInProgress] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"images" | "videos">("images");
  const router = useRouter();

  useEffect(() => {
    const loadListingData = async () => {
      try {
        console.log(`[Listing] Loading listing ID: ${id}`);

        const [listingData, likeStatus, requestStatus] = await Promise.all([
          apiFetch<Listing>(`/listings/${id}`),
          apiFetch<{ liked: boolean; likesCount: number }>(
            `/listings/${id}/like-status`,
          ).catch((err) => {
            console.warn("[Listing] Like status fetch failed:", err);
            return { liked: false, likesCount: 0 };
          }),
          apiFetch<{ sent: boolean; status?: string }>(
            `/requests/status/${id}`,
          ).catch((err) => {
            console.warn("[Listing] Request status fetch failed:", err);
            return { sent: false };
          }),
        ]);

        console.log("[Listing] Data loaded successfully:", {
          listingId: listingData._id,
          rent: listingData.rent,
          liked: likeStatus.liked,
        });

        setListing(listingData);
        setLiked(likeStatus.liked);
        setLikesCount(likeStatus.likesCount);
        setRequestSent(requestStatus.sent);
      } catch (error: any) {
        console.error("[Listing] Failed to load listing:", {
          error: error.message,
          id,
          stack: error.stack,
        });

        // Show error to user but don't force navigation; let them decide what to do next
        alert(
          `Failed to load listing: ${error.message || "Unknown error"}. Please try again.`,
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadListingData();
    }
  }, [id, router]);

  async function handleRequest() {
    if (!listing || sendingRequest) return;

    setSendingRequest(true);
    try {
      await apiFetch("/requests", {
        method: "POST",
        body: JSON.stringify({ listingId: listing._id }),
      });

      setRequestSent(true);
      alert("Request sent successfully!");
    } catch (error: any) {
      if (error.message.includes("Request already sent")) {
        setRequestSent(true);
        alert("You've already sent a request for this listing");
      } else {
        alert(error.message || "Failed to send request");
      }
    } finally {
      setSendingRequest(false);
    }
  }

  async function handleLike() {
    if (!listing || likingInProgress) return;

    setLikingInProgress(true);
    try {
      const response = await apiFetch<{ liked: boolean; likesCount: number }>(
        `/listings/${listing._id}/like`,
        {
          method: "POST",
        },
      );

      setLiked(response.liked);
      setLikesCount(response.likesCount);

      if (response.liked) {
        alert("❤️ Liked! If they like your listing too, you'll see a match!");
      }
    } catch (error: any) {
      alert(error.message || "Failed to like");
    } finally {
      setLikingInProgress(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );

  if (!listing)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Listing not found.</div>
      </div>
    );

  const isOwnerListing = listing.listingType === "owner";
  const displayAddress =
    listing.address || listing.location || "Address not specified";
  const isOwnListing =
    user && listing.creator && listing.creator._id === user._id;

  const hasMedia =
    (listing.images && listing.images.length > 0) ||
    (listing.videos && listing.videos.length > 0);
  const displayMedia =
    selectedTab === "images" ? listing.images : listing.videos;

  const handlePrevImage = () => {
    if (!displayMedia) return;
    setSelectedImage((prev) =>
      prev === 0 ? displayMedia.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    if (!displayMedia) return;
    setSelectedImage((prev) =>
      prev === displayMedia.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Media Gallery */}
      {hasMedia && (
        <div className="relative bg-black">
          {/* Tab Selector for Images/Videos */}
          {listing.images &&
            listing.images.length > 0 &&
            listing.videos &&
            listing.videos.length > 0 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/20 backdrop-blur-sm rounded-lg p-1 flex gap-1">
                <button
                  onClick={() => setSelectedTab("images")}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    selectedTab === "images"
                      ? "bg-white text-gray-900"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Images ({listing.images.length})
                </button>
                <button
                  onClick={() => setSelectedTab("videos")}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    selectedTab === "videos"
                      ? "bg-white text-gray-900"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Videos ({listing.videos.length})
                </button>
              </div>
            )}

          {/* Display current media */}
          {displayMedia && displayMedia.length > 0 && (
            <>
              <div className="relative w-full h-96 bg-black flex items-center justify-center">
                {selectedTab === "images" ? (
                  <img
                    src={displayMedia[selectedImage]}
                    alt="Property"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <video
                    src={displayMedia[selectedImage]}
                    controls
                    className="max-w-full max-h-full"
                  />
                )}

                {/* Left Navigation Button */}
                {displayMedia.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-800" />
                    </button>

                    {/* Right Navigation Button */}
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-800" />
                    </button>
                  </>
                )}
              </div>

              {/* Navigation Dots */}
              {displayMedia.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {displayMedia.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === selectedImage ? "bg-white w-8" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          <div className="absolute top-4 left-4">
            <Link
              href="/home"
              className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-gray-800 hover:bg-white transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>
      )}

      {/* No Media - Show Header */}
      {!hasMedia && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
          <Link
            href="/home"
            className="text-white hover:text-gray-100 mb-4 inline-block"
          >
            ← Back to Feed
          </Link>
          <div className="flex items-center justify-center h-40 bg-white/10 rounded-lg">
            <ImageIcon className="h-16 w-16 text-white/50" />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex justify-between items-start mb-4">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isOwnerListing
                  ? "bg-purple-100 text-purple-700"
                  : "bg-pink-100 text-pink-700"
              }`}
            >
              {isOwnerListing
                ? "🏠 Property Available"
                : "🔍 Looking for Property"}
            </span>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold capitalize">
              {listing.accommodationType === "whole-property"
                ? "Whole Property"
                : "Room"}{" "}
              • {listing.propertyType}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            ₹{listing.rent}/month
          </h1>

          <div className="flex items-start gap-2 text-gray-600 mb-4">
            <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{displayAddress}</span>
          </div>

          {listing.availableFrom && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-5 w-5" />
              <span>
                Available from{" "}
                {new Date(listing.availableFrom).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Financial Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Financial Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Monthly Rent</div>
              <div className="text-lg font-semibold text-gray-900">
                ₹{listing.rent}
              </div>
            </div>
            {listing.securityDeposit ? (
              <div>
                <div className="text-sm text-gray-600">Security Deposit</div>
                <div className="text-lg font-semibold text-gray-900">
                  ₹{listing.securityDeposit}
                </div>
              </div>
            ) : null}
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <CheckCircle
                  className={`h-5 w-5 ${listing.billsIncluded ? "text-green-600" : "text-gray-400"}`}
                />
                <span
                  className={
                    listing.billsIncluded
                      ? "text-green-600 font-medium"
                      : "text-gray-600"
                  }
                >
                  Bills {listing.billsIncluded ? "Included" : "Not Included"}
                </span>
              </div>
            </div>
          </div>

          {/* Bills Breakdown */}
          {listing.billsIncluded && listing.billsBreakdown && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Bills Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {listing.billsBreakdown.electricity && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Electricity</span>
                    <span className="font-medium text-gray-900">
                      ₹{listing.billsBreakdown.electricity}
                    </span>
                  </div>
                )}
                {listing.billsBreakdown.maintenance && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maintenance</span>
                    <span className="font-medium text-gray-900">
                      ₹{listing.billsBreakdown.maintenance}
                    </span>
                  </div>
                )}
                {listing.billsBreakdown.wifi && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">WiFi</span>
                    <span className="font-medium text-gray-900">
                      ₹{listing.billsBreakdown.wifi}
                    </span>
                  </div>
                )}
                {listing.billsBreakdown.gas && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gas</span>
                    <span className="font-medium text-gray-900">
                      ₹{listing.billsBreakdown.gas}
                    </span>
                  </div>
                )}
                {listing.billsBreakdown.water && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water</span>
                    <span className="font-medium text-gray-900">
                      ₹{listing.billsBreakdown.water}
                    </span>
                  </div>
                )}
                {listing.billsBreakdown.other?.map((bill, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{bill.name}</span>
                    <span className="font-medium text-gray-900">
                      ₹{bill.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Charges */}
          {listing.additionalCharges && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Additional Charges
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {listing.additionalCharges.maid && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maid</span>
                    <span className="font-medium text-gray-900">
                      ₹{listing.additionalCharges.maid}
                    </span>
                  </div>
                )}
                {listing.additionalCharges.cook && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cook</span>
                    <span className="font-medium text-gray-900">
                      ₹{listing.additionalCharges.cook}
                    </span>
                  </div>
                )}
                {listing.additionalCharges.other?.map((charge, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{charge.name}</span>
                    <span className="font-medium text-gray-900">
                      ₹{charge.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {listing.description && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-900">
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {listing.description}
            </p>
          </div>
        )}

        {/* Preferences */}
        {(listing.dietaryPreference ||
          listing.occupationType ||
          listing.genderPref) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Preferences
            </h2>

            {listing.dietaryPreference &&
              listing.dietaryPreference.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    Dietary Preference
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {listing.dietaryPreference.map((pref) => (
                      <span
                        key={pref}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium capitalize"
                      >
                        {pref === "veg"
                          ? "Vegetarian"
                          : pref === "non-veg"
                            ? "Non-Vegetarian"
                            : pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {listing.occupationType && listing.occupationType.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  Occupation Type
                </div>
                <div className="flex flex-wrap gap-2">
                  {listing.occupationType.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize"
                    >
                      {type === "working"
                        ? "Working Professional"
                        : type === "student"
                          ? "Student"
                          : type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {listing.genderPref && listing.genderPref !== "any" && (
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  Gender Preference
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                  {listing.genderPref} Only
                </span>
              </div>
            )}

            {listing.furnishing && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Furnishing</div>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">
                  {listing.furnishing}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Amenities */}
        {listing.amenities && listing.amenities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Amenities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {listing.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Thumbnails */}
        {((listing.images && listing.images.length > 1) ||
          (listing.videos && listing.videos.length > 0)) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Gallery
            </h2>

            {/* Images */}
            {listing.images && listing.images.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Images ({listing.images.length})
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedTab("images");
                        setSelectedImage(index);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity ${
                        index === selectedImage && selectedTab === "images"
                          ? "ring-4 ring-purple-500"
                          : "ring-1 ring-gray-200"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {listing.videos && listing.videos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Videos ({listing.videos.length})
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {listing.videos.map((video, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedTab("videos");
                        setSelectedImage(index);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden bg-black hover:opacity-80 transition-opacity ${
                        index === selectedImage && selectedTab === "videos"
                          ? "ring-4 ring-purple-500"
                          : "ring-1 ring-gray-200"
                      }`}
                    >
                      <video
                        src={video}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-gray-800 border-b-8 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Creator Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Posted By
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-purple-200 overflow-hidden bg-white flex-shrink-0">
              <img
                src={getProfileImage(listing.creator)}
                alt={listing.creator?.name || "User"}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-semibold text-lg text-gray-900">
                {listing.creator?.name || "Unknown"}
              </div>
              <div className="text-gray-600">
                {listing.creator?.age && `${listing.creator.age} years`}
                {listing.creator?.gender && ` • ${listing.creator.gender}`}
                {listing.creator?.city && ` • ${listing.creator.city}`}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isOwnListing && (
          <div className="grid grid-cols-2 gap-3">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={likingInProgress}
              className={`py-4 rounded-lg font-semibold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                liked
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                  : "bg-white border-2 border-gray-300 text-gray-700 hover:border-pink-500"
              }`}
            >
              <Heart className={`h-6 w-6 ${liked ? "fill-white" : ""}`} />
              {liked ? "Liked" : "Like"}
            </button>

            {/* Request Button */}
            <button
              onClick={handleRequest}
              disabled={requestSent || sendingRequest}
              className={`py-4 rounded-lg font-semibold text-lg shadow-lg transition-all ${
                requestSent
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl"
              }`}
            >
              {sendingRequest
                ? "Sending..."
                : requestSent
                  ? "Request Sent ✓"
                  : "Send Request"}
            </button>
          </div>
        )}

        {isOwnListing && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-6 text-center">
            <p className="text-lg font-semibold text-gray-800">
              This is your listing
            </p>
            <p className="text-sm text-gray-600 mt-1">
              You cannot send a request to your own listing
            </p>
          </div>
        )}
      </div>

      <NavBar />
    </div>
  );
}
