"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 p-3 z-50 shadow-lg">
      <div className="mx-auto max-w-md grid grid-cols-4 gap-2">
        <Link href="/home" className={pathname === "/home" ? "text-pink-600 font-bold" : "text-gray-500"}>
          <div className="text-center text-lg">🏠</div>
          <div className="text-xs">Home</div>
        </Link>
        <Link href="/requests" className={pathname === "/requests" ? "text-pink-600 font-bold" : "text-gray-500"}>
          <div className="text-center text-lg">📨</div>
          <div className="text-xs">Requests</div>
        </Link>
        <Link href="/matches" className={pathname === "/matches" ? "text-pink-600 font-bold" : "text-gray-500"}>
          <div className="text-center text-lg">❤️</div>
          <div className="text-xs">Matches</div>
        </Link>
        <Link href="/profile" className={pathname === "/profile" ? "text-pink-600 font-bold" : "text-gray-500"}>
          <div className="text-center text-lg">👤</div>
          <div className="text-xs">Profile</div>
        </Link>
      </div>
    </nav>
  );
}
