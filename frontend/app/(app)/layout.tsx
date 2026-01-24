"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import NavBar from "@/components/Navbar";
// import NavBar from "@/components/NavBar";

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <>
      {children}
      <NavBar />
    </>
  );
}
