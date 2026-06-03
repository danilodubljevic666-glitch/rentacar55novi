import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rentacar55.vercel.app",
      },
    ],
  },
};

export default nextConfig;
