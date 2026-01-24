"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function ListingFormPage() {
  const params = useSearchParams();
  const type = (params.get("type") as "room" | "flat") || "room";

  const [rent, setRent] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [genderPref, setGenderPref] = useState("any");
  const [availableFrom, setAvailableFrom] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    await apiFetch("/listings", {
      method: "POST",
      body: JSON.stringify({
        type,
        rent,
        location,
        description,
        genderPref,
        availableFrom
      })
    });

    router.replace("/home");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl bg-slate-800 p-5"
      >
        <h2 className="text-xl font-semibold">
          Listing – {type === "room" ? "Room" : "Flat"}
        </h2>
        <input
          className="w-full rounded bg-slate-900 px-3 py-2"
          placeholder="Rent per month"
          type="number"
          value={rent ?? ""}
          onChange={(e) => setRent(Number(e.target.value))}
        />
        <input
          className="w-full rounded bg-slate-900 px-3 py-2"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <textarea
          className="w-full rounded bg-slate-900 px-3 py-2"
          placeholder="Description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="w-full rounded bg-slate-900 px-3 py-2"
          value={genderPref}
          onChange={(e) => setGenderPref(e.target.value)}
        >
          <option value="any">Gender – Any</option>
          <option value="male">Only male</option>
          <option value="female">Only female</option>
        </select>
        <input
          type="date"
          className="w-full rounded bg-slate-900 px-3 py-2"
          value={availableFrom}
          onChange={(e) => setAvailableFrom(e.target.value)}
        />
        <button className="w-full rounded bg-indigo-500 py-2 font-medium">
          Publish listing
        </button>
      </form>
    </div>
  );
}
