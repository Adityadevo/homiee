/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  output: "export", // 👈 Netlify ke liye important

  images: {
    unoptimized: true, // 👈 static export ke liye
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
