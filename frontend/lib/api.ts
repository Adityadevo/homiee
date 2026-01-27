"use client";

import { getToken, clearToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const BASE_URL = `${API_URL}/api`;

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

  const fullUrl = `${BASE_URL}${path}`;
  console.log(`[API] Fetching: ${options.method || 'GET'} ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers
    });

    if (!res.ok) {
      // Handle 401 - Unauthorized (token expired or invalid)
      if (res.status === 401) {
        console.error("[API] Unauthorized - clearing token");
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

      console.error(`[API] Error: ${errorMessage}`, { status: res.status, url: fullUrl });
      throw new Error(errorMessage);
    }

    console.log(`[API] Success: ${options.method || 'GET'} ${fullUrl}`);
    
    if (res.status === 204) return {} as T;
    return res.json();
  } catch (error: any) {
    // Network or fetch errors
    console.error("[API] Fetch error:", {
      message: error.message,
      url: fullUrl,
      method: options.method || 'GET'
    });
    throw error;
  }
}
