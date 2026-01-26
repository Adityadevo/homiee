// frontend/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const BASE_URL = `${API_URL}/api`;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}
