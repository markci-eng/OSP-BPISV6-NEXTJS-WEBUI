import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.23.136", "192.168.1.16", "192.168.1.4"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "scontent-lga3-1.xx.fbcdn.net"
      }
    ],
  },
};

export default nextConfig;
