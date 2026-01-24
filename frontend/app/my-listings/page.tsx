"use client";
import { useEffect, useState } from "react";

export default function MyListings() {
  const [data, setData] = useState<any[]>([]);
  const email = localStorage.getItem("email");

  useEffect(() => {
    if (!email) return;

    fetch(`http://localhost:5000/api/listings/my/${email}`)
      .then(res => res.json())
      .then(setData);
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
