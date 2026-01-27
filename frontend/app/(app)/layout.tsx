"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken } from "@/lib/auth";
import NavBar from "@/components/Navbar";

export const dynamic = 'force-dynamic';

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // First mount check
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    // Only check auth after component has mounted
    if (!hasMounted) return;

    const checkAuth = () => {
      const token = getToken();
      
      console.log("[Auth Check]", { 
        token: token ? "exists" : "missing", 
        pathname,
        timestamp: new Date().toISOString() 
      });
      
      if (!token) {
        console.log("[Auth] No token, redirecting to login");
        router.replace("/login");
        setIsAuthenticated(false);
      } else {
        console.log("[Auth] Token found, user authenticated");
        setIsAuthenticated(true);
      }
      
      setIsCheckingAuth(false);
    };

    // Longer delay to ensure everything is hydrated
    const timeoutId = setTimeout(checkAuth, 200);
    
    return () => clearTimeout(timeoutId);
  }, [router, pathname, hasMounted]);

  // Show loading during auth check
  if (!hasMounted || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Rommie
          </div>
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {children}
      <NavBar />
    </>
  );
}
