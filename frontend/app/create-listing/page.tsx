"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type ListingType = "owner" | "buyer";
type PropertyType = "room" | "flat";

export default function CreateListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Form state
  const [listingType, setListingType] = useState<ListingType | null>(null);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [rent, setRent] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [genderPref, setGenderPref] = useState("any");
  
  // Owner specific
  const [furnishing, setFurnishing] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  
  // Buyer specific
  const [moveInDate, setMoveInDate] = useState("");
  const [occupationType, setOccupationType] = useState("");
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!listingType || !propertyType) return;
    
    setSubmitting(true);
    try {
      const payload: any = {
        listingType,
        propertyType,
        rent: rent ? Number(rent) : 0,
        location,
        description,
        genderPref,
      };

      if (listingType === "owner") {
        payload.furnishing = furnishing;
        payload.availableFrom = availableFrom;
      } else {
        payload.moveInDate = moveInDate;
        payload.occupationType = occupationType;
      }

      await apiFetch("/listings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push("/profile");
    } catch (err) {
      console.error("Failed to create listing:", err);
      alert("Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link href="/profile" className="text-gray-600 hover:text-gray-900 mb-6 inline-block">
          ← Back
        </Link>

        {/* Step 1: Choose Listing Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black mb-2 text-gray-800">Create Listing</h1>
              <p className="text-gray-600">What do you want to do?</p>
            </div>

            <button
              onClick={() => {
                setListingType("owner");
                setStep(2);
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl p-8 text-left hover:shadow-xl hover:-translate-y-1 transition-all shadow-md"
            >
              <div className="text-5xl mb-3">🏠</div>
              <h2 className="text-2xl font-bold mb-2">I Have a Place</h2>
              <p className="text-white/90">
                I have a room or flat to rent out
              </p>
            </button>

            <button
              onClick={() => {
                setListingType("buyer");
                setStep(2);
              }}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-8 text-left hover:shadow-xl hover:-translate-y-1 transition-all shadow-md"
            >
              <div className="text-5xl mb-3">🔍</div>
              <h2 className="text-2xl font-bold mb-2">I Need a Place</h2>
              <p className="text-white/90">
                I'm looking for a room or flat to rent
              </p>
            </button>
          </div>
        )}

        {/* Step 2: Choose Property Type */}
        {step === 2 && (
          <div className="space-y-6">
            <button
              onClick={() => setStep(1)}
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Back
            </button>

            <div className="text-center mb-8">
              <h1 className="text-4xl font-black mb-2 text-gray-800">Property Type</h1>
              <p className="text-gray-600">
                {listingType === "owner" 
                  ? "What do you have?" 
                  : "What are you looking for?"}
              </p>
            </div>

            <button
              onClick={() => {
                setPropertyType("room");
                setStep(3);
              }}
              className="w-full bg-white hover:bg-gray-50 rounded-2xl p-6 text-left border-2 border-gray-300 hover:border-pink-500 transition-all shadow-md"
            >
              <div className="text-4xl mb-2">🚪</div>
              <h2 className="text-xl font-bold text-gray-800">Room</h2>
              <p className="text-gray-600 text-sm">Single room in shared space</p>
            </button>

            <button
              onClick={() => {
                setPropertyType("flat");
                setStep(3);
              }}
              className="w-full bg-white hover:bg-gray-50 rounded-2xl p-6 text-left border-2 border-gray-300 hover:border-pink-500 transition-all shadow-md"
            >
              <div className="text-4xl mb-2">🏢</div>
              <h2 className="text-xl font-bold text-gray-800">Flat</h2>
              <p className="text-gray-600 text-sm">Complete apartment/flat</p>
            </button>
          </div>
        )}

        {/* Step 3: Details Form */}
        {step === 3 && (
          <div className="space-y-6">
            <button
              onClick={() => setStep(2)}
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Back
            </button>

            <div className="bg-white rounded-2xl p-6 space-y-5 shadow-lg border border-gray-200">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-black mb-2 text-gray-800">
                  {listingType === "owner" ? "🏠 Owner" : "🔍 Buyer"} Details
                </h1>
                <p className="text-gray-600 text-sm">
                  {propertyType === "room" ? "Room" : "Flat"} listing
                </p>
              </div>

              {/* Rent */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  {listingType === "owner" ? "Monthly Rent" : "Budget"} (₹)
                </label>
                <input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  placeholder="e.g., 8000"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:border-pink-500 focus:outline-none text-gray-800"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Koramangala, Bangalore"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:border-pink-500 focus:outline-none text-gray-800"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    listingType === "owner"
                      ? "Describe your property..."
                      : "Describe what you're looking for..."
                  }
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:border-pink-500 focus:outline-none resize-none text-gray-800"
                />
              </div>

              {/* Gender Preference */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Gender Preference
                </label>
                <select
                  value={genderPref}
                  onChange={(e) => setGenderPref(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:border-pink-500 focus:outline-none text-gray-800"
                >
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Owner Specific Fields */}
              {listingType === "owner" && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      Furnishing
                    </label>
                    <select
                      value={furnishing}
                      onChange={(e) => setFurnishing(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:border-pink-500 focus:outline-none text-gray-800"
                    >
                      <option value="">Select...</option>
                      <option value="furnished">Furnished</option>
                      <option value="semi-furnished">Semi-Furnished</option>
                      <option value="unfurnished">Unfurnished</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      Available From
                    </label>
                    <input
                      type="date"
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:border-pink-500 focus:outline-none text-gray-800"
                    />
                  </div>
                </>
              )}

              {/* Buyer Specific Fields */}
              {listingType === "buyer" && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      Move In Date
                    </label>
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:border-pink-500 focus:outline-none text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      Occupation Type
                    </label>
                    <select
                      value={occupationType}
                      onChange={(e) => setOccupationType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:border-pink-500 focus:outline-none text-gray-800"
                    >
                      <option value="">Select...</option>
                      <option value="single">Single (alone)</option>
                      <option value="shared">Shared (with roommates)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !location || !description}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? "Creating..." : "Create Listing"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
