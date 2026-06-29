import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.200.77"],
  output: "export",
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
