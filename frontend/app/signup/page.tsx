"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Signup() {
  const router = useRouter(); // ✅ hook inside component
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  async function submit() {
    setError("");

    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    // ❌ if user already exists or error
    if (!res.ok) {
      setError(data.message || "Signup failed");
      return;
    }

    // ✅ new user created
    alert("Signup successful, please login");
    router.push("/login");
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Signup</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <br />

      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <br />

      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <br />

      <button onClick={submit}>Signup</button>
    </div>
  );
}
