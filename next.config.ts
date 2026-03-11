import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js to NOT bundle these packages (they use dynamic require internally)
  serverExternalPackages: ['dukascopy-node', 'fastest-validator', 'cli-highlight', 'prettier'],
  // images: {
  //   remotePatterns: [],
  // },
};

export default nextConfig;
