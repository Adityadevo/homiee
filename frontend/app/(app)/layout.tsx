"use client";

import NavBar from "@/components/Navbar";

export const dynamic = 'force-dynamic';

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // No auth check - anyone can access
  console.log("[Layout] No auth check - open access");

  return (
    <>
      {children}
      <NavBar />
    </>
  );
}
