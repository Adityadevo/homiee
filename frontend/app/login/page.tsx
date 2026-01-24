"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<{ token: string }>(
        `/auth/${mode}`,
        {
          method: "POST",
          body: JSON.stringify({ email, password })
        }
      );
      saveToken(data.token);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md space-y-6 px-4">
        <h1 className="text-2xl font-semibold text-center">
          {mode === "login" ? "Login" : "Create account"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            className="w-full rounded bg-indigo-500 py-2 font-medium disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}
          </button>
        </form>

        <button
          className="w-full text-sm text-slate-300"
          onClick={() =>
            setMode((m) => (m === "login" ? "signup" : "login"))
          }
        >
          {mode === "login"
            ? "New here? Create account"
            : "Already have account? Login"}
        </button>
      </div>
    </div>
  );
}
