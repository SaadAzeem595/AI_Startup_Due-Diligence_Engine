import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TS type safety checks active, but ignore lint rules
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
