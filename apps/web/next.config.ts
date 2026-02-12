import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Required for Docker/Railway: standalone output for smaller image
  output: "standalone",

  // ⚡ Performance optimizations
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["lucide-react", "recharts", "@radix-ui/react-slot"],
  },

  // 🖼️ Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rukny-storage.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // ℹ️ Note: API proxy is handled by route handlers in app/api/[...path]/route.ts
  // Those handlers read API_BACKEND_URL at runtime, not build-time
  // So no rewrites needed here - request flow:
  // 1. Browser → /api/v1/* → route handler
  // 2. Route handler reads env.API_BACKEND_URL (runtime) → backend API

  // 🔒 Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
