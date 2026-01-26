"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Inbox, Heart, User } from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 p-3 z-50 shadow-lg">
      <div className="mx-auto max-w-md grid grid-cols-4 gap-2">
        <Link href="/home" className={pathname === "/home" ? "text-pink-600 font-bold" : "text-gray-500"}>
          <div className="text-center flex justify-center">
            <Home className="h-6 w-6" />
          </div>
          <div className="text-xs text-center mt-1">Home</div>
        </Link>
        <Link href="/requests" className={pathname === "/requests" ? "text-pink-600 font-bold" : "text-gray-500"}>
          <div className="text-center flex justify-center">
            <Inbox className="h-6 w-6" />
          </div>
          <div className="text-xs text-center mt-1">Requests</div>
        </Link>
        <Link href="/matches" className={pathname === "/matches" ? "text-pink-600 font-bold" : "text-gray-500"}>
          <div className="text-center flex justify-center">
            <Heart className="h-6 w-6" />
          </div>
          <div className="text-xs text-center mt-1">Matches</div>
        </Link>
        <Link href="/profile" className={pathname === "/profile" ? "text-pink-600 font-bold" : "text-gray-500"}>
          <div className="text-center flex justify-center">
            <User className="h-6 w-6" />
          </div>
          <div className="text-xs text-center mt-1">Profile</div>
        </Link>
      </div>
    </nav>
  );
}
