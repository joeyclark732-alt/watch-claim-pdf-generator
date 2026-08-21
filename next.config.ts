import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Static export has no image optimization server; this app also never
  // fetches remote images, so unoptimized <img> output is correct either way.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
