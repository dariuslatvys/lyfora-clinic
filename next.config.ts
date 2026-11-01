import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  // Keep the bundled demo SQLite available to serverless functions on Vercel.
  // Local writable DB must not be required in the serverless bundle.
  outputFileTracingIncludes: {
    "/*": [
      "./data/demo/lyfora.sqlite",
      "./data/parsed/**",
    ],
  },
  outputFileTracingExcludes: {
    "/*": ["./data/db/**", "./data/uploads/**", "./data/lyfora-source/**"],
  },
};

export default nextConfig;
