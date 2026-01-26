"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const dynamic = 'force-dynamic';

export default function MyListings() {
  const [data, setData] = useState<any[]>([]);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get email from localStorage only on client-side
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("email");
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    if (!email) return;

    fetch(`${API_URL}/api/listings/my/${email}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Error fetching listings:", err));
  }, [email]);

  return (
    <div>
      <h2>My Listings</h2>

      {data.length === 0 && <p>No listings yet</p>}

      {data.map((l) => (
        <div key={l._id}>
          {l.city} ₹{l.rent} ({l.type})
        </div>
      ))}
    </div>
  );
}
