import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  // Keep the bundled demo SQLite available to serverless functions on Vercel.
  outputFileTracingIncludes: {
    "/*": ["./data/demo/lyfora.sqlite"],
  },
};

export default nextConfig;
