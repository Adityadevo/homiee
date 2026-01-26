"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useCurrentUser, User } from "@/lib/useCurrentUser";
import NavBar from "@/components/Navbar";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import Link from "next/link";
import { Edit, Phone, MapPin, Briefcase, Save, X, FileText, Plus, LogOut } from "lucide-react";

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
    if (formData.profilePicture && formData.profilePicture.trim() !== "") return formData.profilePicture;
    return "https://pixabay.com/get/gcc98e3544acdd60d2dbce22da5a8d96635dc4af2d465703464a169c3db289f7c0a3e5ce08c33c230e12ca42599157eb0.svg";
  };

  if (loading) return <div className="min-h-screen bg-gray-50 pt-20 p-6 text-gray-700">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-8 pb-24 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-purple-100">
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
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow-lg"
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
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                  
                  {formData.contactNumber && (
                    <p className="text-gray-700 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {formData.contactNumber}
                    </p>
                  )}
                  
                  {(formData.city || formData.area) && (
                    <p className="text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {formData.area && `${formData.area}, `}{formData.city}
                    </p>
                  )}
                  
                  {formData.jobType && (
                    <p className="text-gray-700 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {formData.jobType}
                    </p>
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
                      className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
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
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">My Listings ({myListings.length})</h2>
            <Link
              href="/create-listing"
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create
            </Link>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl p-1.5 flex gap-1.5 mb-4 shadow-lg border border-purple-100">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              All ({myListings.length})
            </button>
            <button
              onClick={() => setActiveTab("owner")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "owner"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              My Properties ({myListings.filter(l => l.listingType === "owner").length})
            </button>
            <button
              onClick={() => setActiveTab("buyer")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "buyer"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              My Posts   ({myListings.filter(l => l.listingType === "buyer").length})
            </button>
          </div>

          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-xl border border-purple-100">
              <div className="flex justify-center mb-4">
                <FileText className="h-24 w-24 text-purple-200" />
              </div>
              <p className="text-gray-600 mb-4 text-lg">No listings published yet</p>
              <Link
                href="/create-listing"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-4 w-4" />
                Create Your First Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => (
                <Link
                  key={listing._id}
                  href={`/listing/${listing._id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-purple-100 hover:border-purple-300 transform hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="h-40 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center overflow-hidden">
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
                      <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ₹{listing.rent}/mo
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                        listing.listingType === "owner"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-pink-100 text-pink-700"
                      }`}>
                        {listing.propertyType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 flex items-start gap-1">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {listing.location}
                    </p>
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
          className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-3 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
      
      <NavBar />
    </div>
  );
}
