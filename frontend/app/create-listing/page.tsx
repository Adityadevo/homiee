"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import ImageUpload from "@/components/ImageUpload";

export default function CreateListingPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  
  const [formData, setFormData] = useState({
    listingType: "owner" as "owner" | "buyer",
    accommodationType: "room" as "room" | "whole-property",
    propertyType: "apartment",
    rent: "",
    address: "",
    location: "",
    area: "",
    description: "",
    genderPref: "any",
    furnishing: "",
    availableFrom: "",
    moveInDate: "",
    occupationType: [] as string[],
    contactNumber: "",
    dietaryPreference: [] as string[],
    amenities: [] as string[],
    numberOfPeople: "1"
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill user data when component loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactNumber: (user as any).contactNumber || "",
        location: user.city || "",
        area: (user as any).area || ""
      }));
    }
  }, [user]);

  const toggleArrayField = (field: "occupationType" | "dietaryPreference" | "amenities", value: string) => {
    setFormData(prev => {
      const currentArray = prev[field];
      if (currentArray.includes(value)) {
        return { ...prev, [field]: currentArray.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...currentArray, value] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation based on listing type
    if (formData.listingType === "owner") {
      if (!formData.address || !formData.rent || !formData.availableFrom) {
        setError("Please fill all required fields");
        return;
      }
    } else {
      if (!formData.rent || !formData.moveInDate || !formData.area || !formData.location) {
        setError("Please fill all required fields (Budget, Move-in Date, Area, City)");
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload: any = {
        listingType: formData.listingType,
        accommodationType: formData.accommodationType,
        propertyType: formData.propertyType,
        rent: Number(formData.rent),
        location: formData.location,
        area: formData.area,
        description: formData.description,
        contactNumber: formData.contactNumber,
        images
      };

      // Owner-specific fields
      if (formData.listingType === "owner") {
        payload.address = formData.address;
        payload.availableFrom = new Date(formData.availableFrom);
        payload.dietaryPreference = formData.dietaryPreference.length > 0 ? formData.dietaryPreference : ["any"];
        payload.occupationType = formData.occupationType.length > 0 ? formData.occupationType : ["any"];
        payload.amenities = formData.amenities;
        payload.genderPref = formData.genderPref;
        payload.furnishing = formData.furnishing;
      } else {
        // Buyer-specific fields
        payload.moveInDate = new Date(formData.moveInDate);
        payload.numberOfPeople = formData.numberOfPeople;
        // For buyers, we don't need address validation
        payload.address = `Looking in ${formData.area}, ${formData.location}`;
        payload.availableFrom = new Date(formData.moveInDate);
      }
      
      await apiFetch("/listings", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      alert("Listing created successfully!");
      router.push("/home");
    } catch (err: any) {
      setError(err.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl animate-pulse text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Create New Listing
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Listing Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                I am a *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, listingType: "owner"})}
                  className={`py-3 rounded-xl font-bold transition-all ${
                    formData.listingType === "owner"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  🏠 I Have a Place
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, listingType: "buyer"})}
                  className={`py-3 rounded-xl font-bold transition-all ${
                    formData.listingType === "buyer"
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  🔍 I Need a Place
                </button>
              </div>
            </div>

            {/* Accommodation Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Accommodation Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, accommodationType: "room"})}
                  className={`py-3 rounded-xl font-bold transition-all ${
                    formData.accommodationType === "room"
                      ? "bg-purple-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  🚪 Room
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, accommodationType: "whole-property"})}
                  className={`py-3 rounded-xl font-bold transition-all ${
                    formData.accommodationType === "whole-property"
                      ? "bg-purple-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  🏢 Whole Property
                </button>
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                required
              >
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="house">House</option>
                <option value="townhouse">Townhouse</option>
                <option value="basement">Basement</option>
                <option value="loft">Loft</option>
                <option value="studio">Studio</option>
                <option value="trailer">Trailer</option>
              </select>
            </div>

            {/* Address - Only for owners */}
            {formData.listingType === "owner" && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required={formData.listingType === "owner"}
                  placeholder="Enter complete address"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            )}

            {/* Rent/Budget */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {formData.listingType === "owner" ? "Rent (₹/month) *" : "Budget (₹/month) *"}
              </label>
              <input
                type="number"
                value={formData.rent}
                onChange={(e) => setFormData({...formData, rent: e.target.value})}
                required
                placeholder="e.g., 15000"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-lg"
              />
            </div>

            {/* Location & Area */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {formData.listingType === "owner" ? "City *" : "Preferred City *"}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                  placeholder="e.g., Mumbai"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {formData.listingType === "owner" ? "Area/Locality" : "Preferred Area *"}
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  required={formData.listingType === "buyer"}
                  placeholder="e.g., Andheri West, Bandra, etc."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Available From / Move-in Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {formData.listingType === "owner" ? "Available From *" : "Move-in Date *"}
                </label>
                <input
                  type="date"
                  value={formData.listingType === "owner" ? formData.availableFrom : formData.moveInDate}
                  onChange={(e) => setFormData({
                    ...formData, 
                    [formData.listingType === "owner" ? "availableFrom" : "moveInDate"]: e.target.value
                  })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              {/* Number of People - Only for buyers */}
              {formData.listingType === "buyer" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Number of People *
                  </label>
                  <select
                    value={formData.numberOfPeople}
                    onChange={(e) => setFormData({...formData, numberOfPeople: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                    <option value="5+">5+ People</option>
                  </select>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {formData.listingType === "owner" 
                  ? "Property Description *" 
                  : "About You / Requirements *"}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={5}
                placeholder={formData.listingType === "owner"
                  ? "Describe the property, amenities, nearby facilities, etc."
                  : "Tell about yourself, your work/study, lifestyle, and any specific requirements..."}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                required
                placeholder="e.g., +91 9876543210"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                ✏️ You can edit this for each listing
              </p>
            </div>

            {/* Owner-specific fields */}
            {formData.listingType === "owner" && (
              <>
                {/* Occupation Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Looking For (Occupation)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: "working", label: "Working Professional" },
                      { value: "student", label: "Student" },
                      { value: "any", label: "Any" }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer transition-all ${
                          formData.occupationType.includes(option.value)
                            ? "bg-purple-50 border-purple-500 text-purple-700"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.occupationType.includes(option.value)}
                          onChange={() => toggleArrayField("occupationType", option.value)}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dietary Preference */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Dietary Preference
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: "veg", label: "Vegetarian" },
                      { value: "non-veg", label: "Non-Vegetarian" },
                      { value: "any", label: "Any" }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer transition-all ${
                          formData.dietaryPreference.includes(option.value)
                            ? "bg-purple-50 border-purple-500 text-purple-700"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.dietaryPreference.includes(option.value)}
                          onChange={() => toggleArrayField("dietaryPreference", option.value)}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Parking", "Gym", "Swimming Pool", "Security", "Power Backup", "Elevator", 
                      "WiFi", "Air Conditioning", "Furnished", "Laundry", "Balcony", "Garden"].map((amenity) => (
                      <label
                        key={amenity}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer transition-all ${
                          formData.amenities.includes(amenity)
                            ? "bg-purple-50 border-purple-500 text-purple-700"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => toggleArrayField("amenities", amenity)}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender Preference */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Gender Preference
                  </label>
                  <select
                    value={formData.genderPref}
                    onChange={(e) => setFormData({...formData, genderPref: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="any">Any</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                  </select>
                </div>

                {/* Furnishing */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Furnishing
                  </label>
                  <select
                    value={formData.furnishing}
                    onChange={(e) => setFormData({...formData, furnishing: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="furnished">Fully Furnished</option>
                    <option value="semi-furnished">Semi Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
              </>
            )}

            {/* Image Upload - Only for owners */}
            {formData.listingType === "owner" && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Property Images
                </label>
                <ImageUpload 
                  images={images} 
                  onImagesChange={setImages}
                  maxImages={10}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "🚀 Create Listing"}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
