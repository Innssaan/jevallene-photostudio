import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@photostudio/shared-types"],
};

export default nextConfig;
