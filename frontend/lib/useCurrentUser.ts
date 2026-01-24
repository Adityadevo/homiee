"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import { clearToken, getToken } from "./auth";

export type User = {
  _id: string;
  name?: string;
  age?: number;
  gender?: string;
  jobType?: string;
  city?: string;
  role?: "find" | "provide";
  propertyType?: "room" | "flat";
  budget?: number;
  genderPref?: string;
  email?: string;
};

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch<User>("/auth/me")
      .then((u) => setUser(u))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, setUser, loading };
}
