"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Listing = {
  _id: string;
  city: string;
  rent: number;
  type: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
};

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/listings")
      .then((res) => res.json())
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching listings:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: "220px",
          padding: "20px",
          borderRight: "1px solid #ddd",
        }}
      >
        <h2>Dashboard</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ marginBottom: "10px" }}>
            <Link href="/create">➕ Create Listing</Link>
          </li>
          <li>
            <Link href="/my-listings">📄 My Listings</Link>
          </li>
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "20px" }}>
        <h1>All Listings</h1>

        {loading && <p>Loading listings...</p>}

        {!loading && listings.length === 0 && <p>No listings available</p>}

        {!loading &&
          listings.map((l) => (
            <div
              key={l._id}
              style={{
                border: "1px solid #ccc",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "6px",
              }}
            >
              <p>
                <strong>City:</strong> {l.city}
              </p>
              <p>
                <strong>Rent:</strong> ₹{l.rent}
              </p>
              <p>
                <strong>Type:</strong> {l.type}
              </p>
              <p>
                <strong>Posted by:</strong> {l.userId?.name}
              </p>
            </div>
          ))}
      </main>
    </div>
  );
}
