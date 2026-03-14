// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict mode catches double-render bugs in development
  reactStrictMode: true,

  // The CSV upload API route receives multipart/form-data.
  // Next.js 14+ parses it automatically — no body-parser config needed.

  // If you deploy to a platform that doesn't support Node.js fs (e.g. Edge),
  // move the file-read logic in /api/fleet-report/route.ts to a data-access
  // layer and switch to a database or object-storage source instead.
};

export default nextConfig;
