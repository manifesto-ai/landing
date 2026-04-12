import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@manifesto-ai/sdk",
    "@manifesto-ai/governance",
    "@manifesto-ai/lineage",
    "@manifesto-ai/compiler",
    "@manifesto-ai/core",
    "@manifesto-ai/host",
  ],
};

export default nextConfig;
