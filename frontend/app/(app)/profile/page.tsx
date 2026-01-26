"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useCurrentUser, User } from "@/lib/useCurrentUser";
import NavBar from "@/components/Navbar";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import Link from "next/link";

type Listing = {
  _id: string;
  listingType: "owner" | "buyer";
  propertyType: string;
  rent: number;
  location: string;
  description: string;
  images?: string[];
};

export default function ProfilePage() {
  const { user, setUser, loading } = useCurrentUser();
  const router = useRouter();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "owner" | "buyer">("all");
  const [editMode, setEditMode] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    city: "",
    area: "",
    contactNumber: "",
    jobType: "",
    bio: "",
    profilePicture: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        age: user.age?.toString() || "",
        gender: user.gender || "",
        city: user.city || "",
        area: (user as any).area || "",
        contactNumber: (user as any).contactNumber || "",
        jobType: user.jobType || "",
        bio: (user as any).bio || "",
        profilePicture: (user as any).profilePicture || ""
      });
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

  const handleSaveProfile = async () => {
    try {
      const updated = await apiFetch<User>("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age) || undefined,
          gender: formData.gender,
          city: formData.city,
          area: formData.area,
          contactNumber: formData.contactNumber,
          jobType: formData.jobType,
          bio: formData.bio,
          profilePicture: formData.profilePicture
        })
      });
      setUser(updated);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    }
  };

  const getProfileImage = () => {
    if (formData.profilePicture) return formData.profilePicture;
    // Dummy icons based on gender
    if (formData.gender === "male") return "https://i.pravatar.cc/200?img=12";
    if (formData.gender === "female") return "https://i.pravatar.cc/200?img=47";
    return "https://i.pravatar.cc/200?img=1";
  };

  if (loading) return <div className="min-h-screen bg-white pt-20 p-6 text-gray-700">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 pt-8 pb-24 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            {editMode ? (
              <ProfilePictureUpload
                currentImage={formData.profilePicture || getProfileImage()}
                onImageChange={(url) => setFormData({...formData, profilePicture: url})}
              />
            ) : (
              <img 
                src={getProfileImage()}
                alt={formData.name || "Profile"}
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
              />
            )}

            {/* Profile Info */}
            <div className="flex-1">
              {!editMode ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-800">{user?.name}</h1>
                      <p className="text-gray-600">
                        {formData.age && `${formData.age} years`}
                        {formData.gender && ` • ${formData.gender}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-purple-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-600"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                  
                  {formData.contactNumber && (
                    <p className="text-gray-700">📱 {formData.contactNumber}</p>
                  )}
                  
                  {(formData.city || formData.area) && (
                    <p className="text-gray-700">
                      📍 {formData.area && `${formData.area}, `}{formData.city}
                    </p>
                  )}
                  
                  {formData.jobType && (
                    <p className="text-gray-700">💼 {formData.jobType}</p>
                  )}
                  
                  {formData.bio && (
                    <p className="text-gray-600 mt-3 italic">"{formData.bio}"</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      placeholder="Age"
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    placeholder="Contact Number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="City"
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      placeholder="Area/Locality"
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                  
                  <input
                    type="text"
                    value={formData.jobType}
                    onChange={(e) => setFormData({...formData, jobType: e.target.value})}
                    placeholder="Job Type"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Bio (Tell us about yourself)"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:shadow-lg"
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:border-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Listings */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">My Listings ({myListings.length})</h2>
            <Link
              href="/create-listing"
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:shadow-lg"
            >
              + Create
            </Link>
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
              My Properties ({myListings.filter(l => l.listingType === "owner").length})
            </button>
            <button
              onClick={() => setActiveTab("buyer")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "buyer"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              My Posts   ({myListings.filter(l => l.listingType === "buyer").length})
            </button>
          </div>

          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-200">
              <div className="text-4xl mb-4 opacity-30">📝</div>
              <p className="text-gray-600 mb-4">No listings published yet</p>
              <Link
                href="/create-listing"
                className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:shadow-lg"
              >
                Create Your First Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => (
                <Link
                  key={listing._id}
                  href={`/listing/${listing._id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-200 hover:border-purple-300"
                >
                  {/* Image */}
                  <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.propertyType}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl opacity-30">
                        {listing.listingType === "owner" ? "🏠" : "🔍"}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl font-bold text-purple-600">
                        ₹{listing.rent}/mo
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                        listing.listingType === "owner"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-pink-100 text-pink-700"
                      }`}>
                        {listing.propertyType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">📍 {listing.location}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{listing.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-600"
        >
          🚪 Logout
        </button>
      </div>
      
      <NavBar />
    </div>
  );
}
