"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageChange: (url: string) => void;
}

export default function ProfilePictureUpload({ currentImage, onImageChange }: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const token = localStorage.getItem("rommie_token");
          const res = await fetch("http://localhost:5000/api/upload/image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ image: reader.result })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          onImageChange(data.url);
        } catch (err: any) {
          setError(err.message || "Upload failed");
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to read file");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      {currentImage ? (
        <img 
          src={currentImage}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
        />
      ) : (
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-purple-200">
          ?
        </div>
      )}
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="profile-picture-upload"
        disabled={uploading}
      />
      
      <label
        htmlFor="profile-picture-upload"
        className={`absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full shadow-lg hover:bg-purple-600 cursor-pointer ${
          uploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title={uploading ? "Uploading..." : "Upload profile picture"}
      >
        {uploading ? "⏳" : "📷"}
      </label>
      
      {error && (
        <p className="absolute top-full mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
