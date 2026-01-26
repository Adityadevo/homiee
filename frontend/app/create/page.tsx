"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import { Plus, Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface CustomCharge {
  name: string;
  amount: string;
}

export default function CreateListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Property Address
  const [address, setAddress] = useState("");
  const [hideStreetName, setHideStreetName] = useState(false);

  // Room Details
  const [accommodationType, setAccommodationType] = useState<"room" | "whole-property">("room");
  const [propertyType, setPropertyType] = useState("apartment");

  // Financial Details
  const [rent, setRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [billsIncluded, setBillsIncluded] = useState(false);

  // Bills Breakdown
  const [electricity, setElectricity] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [wifi, setWifi] = useState("");
  const [gas, setGas] = useState("");
  const [water, setWater] = useState("");
  const [customBills, setCustomBills] = useState<CustomCharge[]>([]);

  // Additional Charges
  const [maid, setMaid] = useState("");
  const [cook, setCook] = useState("");
  const [customCharges, setCustomCharges] = useState<CustomCharge[]>([]);

  // Preferences
  const [dietaryPreference, setDietaryPreference] = useState<string[]>([]);
  const [occupationType, setOccupationType] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);

  // Media
  const [images, setImages] = useState<string[]>([]);

  // Listing Type
  const [listingType, setListingType] = useState<"owner" | "buyer">("owner");

  const amenitiesList = [
    "Parking",
    "Gym",
    "Swimming Pool",
    "Security",
    "Power Backup",
    "Elevator",
    "WiFi",
    "Air Conditioning",
    "Furnished",
    "Laundry",
    "Balcony",
    "Garden"
  ];

  const handleToggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleToggleDietary = (pref: string) => {
    if (dietaryPreference.includes(pref)) {
      setDietaryPreference(dietaryPreference.filter(p => p !== pref));
    } else {
      setDietaryPreference([...dietaryPreference, pref]);
    }
  };

  const handleToggleOccupation = (type: string) => {
    if (occupationType.includes(type)) {
      setOccupationType(occupationType.filter(t => t !== type));
    } else {
      setOccupationType([...occupationType, type]);
    }
  };

  const addCustomBill = () => {
    setCustomBills([...customBills, { name: "", amount: "" }]);
  };

  const removeCustomBill = (index: number) => {
    setCustomBills(customBills.filter((_, i) => i !== index));
  };

  const updateCustomBill = (index: number, field: "name" | "amount", value: string) => {
    const updated = [...customBills];
    updated[index][field] = value;
    setCustomBills(updated);
  };

  const addCustomCharge = () => {
    setCustomCharges([...customCharges, { name: "", amount: "" }]);
  };

  const removeCustomCharge = (index: number) => {
    setCustomCharges(customCharges.filter((_, i) => i !== index));
  };

  const updateCustomCharge = (index: number, field: "name" | "amount", value: string) => {
    const updated = [...customCharges];
    updated[index][field] = value;
    setCustomCharges(updated);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (!address || !rent || !availableFrom) {
      setError("Please fill all required fields (Address, Rent, Available From)");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        return;
      }

      // Prepare bills breakdown
      const billsBreakdown: any = {};
      if (billsIncluded) {
        if (electricity) billsBreakdown.electricity = Number(electricity);
        if (maintenance) billsBreakdown.maintenance = Number(maintenance);
        if (wifi) billsBreakdown.wifi = Number(wifi);
        if (gas) billsBreakdown.gas = Number(gas);
        if (water) billsBreakdown.water = Number(water);
        if (customBills.length > 0) {
          billsBreakdown.other = customBills
            .filter(b => b.name && b.amount)
            .map(b => ({ name: b.name, amount: Number(b.amount) }));
        }
      }

      // Prepare additional charges
      const additionalCharges: any = {};
      if (maid) additionalCharges.maid = Number(maid);
      if (cook) additionalCharges.cook = Number(cook);
      if (customCharges.length > 0) {
        additionalCharges.other = customCharges
          .filter(c => c.name && c.amount)
          .map(c => ({ name: c.name, amount: Number(c.amount) }));
      }

      const payload = {
        listingType,
        address,
        hideStreetName,
        accommodationType,
        propertyType,
        rent: Number(rent),
        securityDeposit: securityDeposit ? Number(securityDeposit) : 0,
        availableFrom: new Date(availableFrom),
        billsIncluded,
        billsBreakdown: Object.keys(billsBreakdown).length > 0 ? billsBreakdown : undefined,
        additionalCharges: Object.keys(additionalCharges).length > 0 ? additionalCharges : undefined,
        dietaryPreference: dietaryPreference.length > 0 ? dietaryPreference : ["any"],
        occupationType: occupationType.length > 0 ? occupationType : ["any"],
        amenities,
        images
      };

      const res = await fetch(`${API_URL}/api/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create listing");
        return;
      }

      alert("Listing created successfully!");
      router.push("/listings");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Listing</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Listing Type */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Listing Type</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="owner"
                  checked={listingType === "owner"}
                  onChange={(e) => setListingType(e.target.value as "owner")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">I have a property to rent</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="buyer"
                  checked={listingType === "buyer"}
                  onChange={(e) => setListingType(e.target.value as "buyer")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">I'm looking for a property</span>
              </label>
            </div>
          </div>

          {/* Property Address */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Can't find your address? Type it manually</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideStreetName}
                  onChange={(e) => setHideStreetName(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Hide street name</span>
                  <p className="text-xs text-gray-500">Your street number is always hidden, but you can hide your street name as well.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Room Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Accommodation type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      value="room"
                      checked={accommodationType === "room"}
                      onChange={(e) => setAccommodationType(e.target.value as "room")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Room</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      value="whole-property"
                      checked={accommodationType === "whole-property"}
                      onChange={(e) => setAccommodationType(e.target.value as "whole-property")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Whole property</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property type <span className="text-red-500">*</span>
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rent <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500 text-sm">per month</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security deposit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available from <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billsIncluded}
                    onChange={(e) => setBillsIncluded(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Bills included</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bills Breakdown */}
          {billsIncluded && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bills Breakdown (Optional)</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Electricity</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={electricity}
                      onChange={(e) => setElectricity(e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={maintenance}
                      onChange={(e) => setMaintenance(e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WiFi</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={wifi}
                      onChange={(e) => setWifi(e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gas</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={gas}
                      onChange={(e) => setGas(e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Water</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={water}
                      onChange={(e) => setWater(e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Bills */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Other Bills</label>
                  <button
                    type="button"
                    onClick={addCustomBill}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add custom bill
                  </button>
                </div>
                {customBills.map((bill, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={bill.name}
                      onChange={(e) => updateCustomBill(index, "name", e.target.value)}
                      placeholder="Bill name"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <input
                        type="number"
                        value={bill.amount}
                        onChange={(e) => updateCustomBill(index, "amount", e.target.value)}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustomBill(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Charges */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Charges (Optional)</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maid</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={maid}
                    onChange={(e) => setMaid(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cook</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={cook}
                    onChange={(e) => setCook(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Custom Charges */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Other Charges</label>
                <button
                  type="button"
                  onClick={addCustomCharge}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add custom charge
                </button>
              </div>
              {customCharges.map((charge, index) => (
                <div key={index} className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={charge.name}
                    onChange={(e) => updateCustomCharge(index, "name", e.target.value)}
                    placeholder="Charge name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={charge.amount}
                      onChange={(e) => updateCustomCharge(index, "amount", e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomCharge(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tenant Preferences */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tenant Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Dietary Preference</label>
                <div className="flex flex-wrap gap-3">
                  {["veg", "non-veg", "any"].map((pref) => (
                    <label
                      key={pref}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                        dietaryPreference.includes(pref)
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={dietaryPreference.includes(pref)}
                        onChange={() => handleToggleDietary(pref)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium capitalize">{pref === "veg" ? "Vegetarian" : pref === "non-veg" ? "Non-Vegetarian" : "Any"}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Occupation Type</label>
                <div className="flex flex-wrap gap-3">
                  {["working", "student", "any"].map((type) => (
                    <label
                      key={type}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                        occupationType.includes(type)
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={occupationType.includes(type)}
                        onChange={() => handleToggleOccupation(type)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium capitalize">{type === "working" ? "Working Professional" : type === "student" ? "Student" : "Any"}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenitiesList.map((amenity) => (
                    <label
                      key={amenity}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                        amenities.includes(amenity)
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={amenities.includes(amenity)}
                        onChange={() => handleToggleAmenity(amenity)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <ImageUpload images={images} onImagesChange={setImages} maxImages={10} />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
