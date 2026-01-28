"use client";

import { getToken, clearToken } from "./auth";

// Get API URL from environment or construct from window.location in production
const getApiUrl = () => {
  // If environment variable is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In browser, check if we're in production
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    
    // If on localhost, use localhost backend
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }
    
    // Production fallback - use Render backend
    // This should be set in Vercel environment variables for production
    console.warn("[API] NEXT_PUBLIC_API_URL not set, using production fallback: https://homiee.onrender.com");
    return "https://homiee.onrender.com";
  }
  
  return "http://localhost:5000";
};

const API_URL = getApiUrl();
const BASE_URL = `${API_URL}/api`;

console.log("[API Config]", { API_URL, BASE_URL, env: process.env.NEXT_PUBLIC_API_URL });

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // No auth required - removed token check
  const token = getToken(); // Still get token if exists for backend compatibility

  // use plain object so TS ko pata ho keys string-string hain
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add token if exists (for backend), but don't require it
  if (token) {
    baseHeaders["Authorization"] = `Bearer ${token}`;
  }

  const headers: HeadersInit = {
    ...baseHeaders,
    ...(options.headers as HeadersInit | undefined),
  };

  const fullUrl = `${BASE_URL}${path}`;
  console.log(`[API] Fetching: ${options.method || "GET"} ${fullUrl}`, {
    hasToken: !!token,
    apiUrl: API_URL,
    baseUrl: BASE_URL,
  });

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!res.ok) {
      // No auth redirects - just log and throw error
      if (res.status === 401) {
        console.warn("[API] Unauthorized (401) - but no redirect, continuing...");
        // Don't clear token or redirect
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

      console.error(`[API] Error: ${errorMessage}`, {
        status: res.status,
        url: fullUrl,
      });
      throw new Error(errorMessage);
    }

    console.log(`[API] Success: ${options.method || "GET"} ${fullUrl}`);

    if (res.status === 204) return {} as T;
    return res.json();
  } catch (error: any) {
    // Network or fetch errors
    console.error("[API] Fetch error:", {
      message: error.message,
      url: fullUrl,
      method: options.method || "GET",
    });
    throw error;
  }
}
