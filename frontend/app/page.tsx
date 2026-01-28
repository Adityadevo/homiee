"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    // No auth check - direct redirect to home
    console.log("[Splash] Redirecting to home - no auth required");
    router.replace("/home");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center animate-pulse">
        <div className="text-6xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
          Rommie
        </div>
        <div className="text-2xl text-slate-300 mb-8">
          Finding perfect flatmates
        </div>
        <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
        <div className="text-slate-500 text-lg">Loading...</div>
      </div>
    </div>
  );
}
