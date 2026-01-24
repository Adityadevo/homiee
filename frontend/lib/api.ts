"use client";

import { getToken } from "./auth";

const BASE_URL = "http://localhost:5000/api";

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  // use plain object so TS ko pata ho keys string-string hain
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (token) {
    baseHeaders["Authorization"] = `Bearer ${token}`;
  }

  const headers: HeadersInit = {
    ...baseHeaders,
    ...(options.headers as HeadersInit | undefined)
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}
