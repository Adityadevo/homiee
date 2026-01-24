import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rommie",
  description: "Flat/room mate finder"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
