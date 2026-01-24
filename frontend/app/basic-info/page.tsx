"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function BasicInfoPage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [gender, setGender] = useState("");
  const [jobType, setJobType] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAge(user.age);
      setGender(user.gender || "");
      setJobType(user.jobType || "");
      setCity(user.city || "");
    }
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    await apiFetch("/auth/me", {
      method: "PUT",
      body: JSON.stringify({ name, age, gender, jobType, city })
    });

    setSaving(false);
    router.replace("/purpose");
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl bg-slate-800 p-5"
      >
        <h2 className="text-xl font-semibold">Basic info</h2>
        <input
          className="w-full rounded bg-slate-900 px-3 py-2"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full rounded bg-slate-900 px-3 py-2"
          placeholder="Age"
          type="number"
          value={age ?? ""}
          onChange={(e) => setAge(Number(e.target.value))}
        />
        <select
          className="w-full rounded bg-slate-900 px-3 py-2"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select
          className="w-full rounded bg-slate-900 px-3 py-2"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
        >
          <option value="">Job / Student</option>
          <option value="job">Job</option>
          <option value="student">Student</option>
        </select>
        <input
          className="w-full rounded bg-slate-900 px-3 py-2"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button className="w-full rounded bg-indigo-500 py-2 font-medium">
          {saving ? "Saving..." : "Next"}
        </button>
      </form>
    </div>
  );
}
