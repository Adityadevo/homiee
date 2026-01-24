"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function NeedChooseTypePage() {
  const [propertyType, setPropertyType] = useState<"room" | "flat" | "">("");
  const router = useRouter();

  async function handleNext() {
    if (!propertyType) return;
    await apiFetch("/auth/me", {
      method: "PUT",
      body: JSON.stringify({ propertyType })
    });
    router.replace("/need/preferences");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-slate-800 p-6">
        <h2 className="text-xl font-semibold">Kya chahiye?</h2>
        <button
          onClick={() => setPropertyType("room")}
          className={`w-full rounded border px-3 py-3 text-left ${
            propertyType === "room"
              ? "border-indigo-500 bg-slate-900"
              : "border-slate-600 bg-slate-900/60"
          }`}
        >
          Sirf room
        </button>
        <button
          onClick={() => setPropertyType("flat")}
          className={`w-full rounded border px-3 py-3 text-left ${
            propertyType === "flat"
              ? "border-indigo-500 bg-slate-900"
              : "border-slate-600 bg-slate-900/60"
          }`}
        >
          Pura flat
        </button>
        <button
          disabled={!propertyType}
          onClick={handleNext}
          className="w-full rounded bg-indigo-500 py-2 font-medium disabled:opacity-60"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
