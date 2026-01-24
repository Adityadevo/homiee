"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function NeedPreferencesPage() {
  const params = useSearchParams();
  const type = (params.get("type") as "room" | "flat") || "room";

  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await apiFetch("/listings", {
      method: "POST",
      body: JSON.stringify({
        type,
        rent: Number(budget),
        location,
        description
      })
    });
    router.replace("/home");
  }

  return (
    <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-6 bg-slate-800 rounded-xl">
        <h2 className="text-2xl font-bold">My requirement</h2>
        <input className="w-full p-3 bg-slate-900 rounded" placeholder="Budget" type="number" value={budget} onChange={e => setBudget(e.target.value)} />
        <input className="w-full p-3 bg-slate-900 rounded" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
        <textarea className="w-full p-3 bg-slate-900 rounded" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <button className="w-full bg-indigo-500 p-3 rounded font-bold">Post → Home</button>
      </form>
    </div>
  );
}
