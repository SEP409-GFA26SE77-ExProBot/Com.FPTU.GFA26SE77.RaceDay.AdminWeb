import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  // Local testing only: serve the API (SignalR hub, media) from this origin when DEV_PROXY_API_ORIGIN is set.
  async rewrites() {
    const devApi = process.env.DEV_PROXY_API_ORIGIN?.replace(/\/$/, "");
    if (!devApi) return [];
    return { beforeFiles: [], afterFiles: [], fallback: [{ source: "/:path*", destination: `${devApi}/:path*` }] };
  },
};

export default nextConfig;
