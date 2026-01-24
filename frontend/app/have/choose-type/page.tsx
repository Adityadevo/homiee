"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HaveChooseTypePage() {
  const [type, setType] = useState<"room" | "flat" | "">("");
  const router = useRouter();

  function handleNext() {
    if (!type) return;
    router.push(`/have/listing-form?type=${type}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-slate-800 p-6">
        <h2 className="text-xl font-semibold">Kya available hai?</h2>
        <button
          onClick={() => setType("room")}
          className={`w-full rounded border px-3 py-3 text-left ${
            type === "room"
              ? "border-indigo-500 bg-slate-900"
              : "border-slate-600 bg-slate-900/60"
          }`}
        >
          Sirf room
        </button>
        <button
          onClick={() => setType("flat")}
          className={`w-full rounded border px-3 py-3 text-left ${
            type === "flat"
              ? "border-indigo-500 bg-slate-900"
              : "border-slate-600 bg-slate-900/60"
          }`}
        >
          Pura flat
        </button>
        <button
          disabled={!type}
          onClick={handleNext}
          className="w-full rounded bg-indigo-500 py-2 font-medium disabled:opacity-60"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
