"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateListing() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [rent, setRent] = useState("");
  const [type, setType] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    setEmail(storedEmail);
  }, []);

  async function submit() {
    if (!email) {
      setError("Please login first");
      return;
    }

    const res = await fetch("http://localhost:5000/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city,
        rent: Number(rent),
        type,
        userEmail: email // ✅ email se mapping
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to create listing");
      return;
    }

    router.push("/my-listings");
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Listing</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <br />

      <input
        placeholder="Rent"
        value={rent}
        onChange={(e) => setRent(e.target.value)}
      />
      <br />

      <input
        placeholder="Type (flat/room)"
        value={type}
        onChange={(e) => setType(e.target.value)}
      />
      <br />

      <button onClick={submit}>Create</button>
    </div>
  );
}
