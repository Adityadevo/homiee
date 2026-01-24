"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function PurposePage() {
  const [role, setRole] = useState<"find" | "provide" | "">("");
  const router = useRouter();

  async function handleNext() {
    if (!role) return;
    await apiFetch("/auth/me", {
      method: "PUT",
      body: JSON.stringify({ role })
    });

    if (role === "find") {
      router.replace("/need/choose-type");
    } else {
      router.replace("/have/choose-type");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-slate-800 p-6">
        <h2 className="text-xl font-semibold">What&apos;s your purpose?</h2>
        <button
          onClick={() => setRole("find")}
          className={`w-full rounded border px-3 py-3 text-left ${
            role === "find"
              ? "border-indigo-500 bg-slate-900"
              : "border-slate-600 bg-slate-900/60"
          }`}
        >
          Mujhe flat/room chahiye
        </button>
        <button
          onClick={() => setRole("provide")}
          className={`w-full rounded border px-3 py-3 text-left ${
            role === "provide"
              ? "border-indigo-500 bg-slate-900"
              : "border-slate-600 bg-slate-900/60"
          }`}
        >
          Mere paas flat/room hai
        </button>
        <button
          disabled={!role}
          onClick={handleNext}
          className="w-full rounded bg-indigo-500 py-2 font-medium disabled:opacity-60"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
