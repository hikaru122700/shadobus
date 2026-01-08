import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/shadobus',
  assetPrefix: '/shadobus/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
