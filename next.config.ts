import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/BNB-SCAM-KING',
  assetPrefix: '/BNB-SCAM-KING',
};

export default nextConfig;
