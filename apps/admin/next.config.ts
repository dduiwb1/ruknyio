import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Proxy API requests to backend
  async rewrites() {
    const apiUrl = process.env.API_BACKEND_URL || "http://localhost:3001";

    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
      // Proxy /uploads (avatars, etc.) to API so img src="/uploads/..." works
      {
        source: "/uploads/:path*",
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
