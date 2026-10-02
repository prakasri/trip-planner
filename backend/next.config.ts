import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ws's optional native bufferutil fallback logic gets mangled when
  // webpack bundles it, producing "bufferUtil.mask is not a function" at
  // runtime. Keep these as real Node `require()`s instead of bundling them.
  serverExternalPackages: ["ws", "@neondatabase/serverless", "@prisma/adapter-neon"],
};

export default nextConfig;
