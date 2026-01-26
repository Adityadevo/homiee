"use client";

import { getToken, clearToken } from "./auth";

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

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      // Handle 401 - Unauthorized (token expired or invalid)
      if (res.status === 401) {
        clearToken();
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }

      // Try to parse JSON error message
      let errorMessage = `API error ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, try text
        const text = await res.text();
        if (text) errorMessage = text;
      }

      throw new Error(errorMessage);
    }

    if (res.status === 204) return {} as T;
    return res.json();
  } catch (error: any) {
    // Network or fetch errors
    console.error("API fetch error:", error);
    throw error;
  }
}
