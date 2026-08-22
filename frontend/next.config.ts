import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  async rewrites() {
    return [
      {
        source: "/geoserver/:path*",
        destination: "http://geoserver:8080/geoserver/:path*",
      },
    ];
  },
};

export default nextConfig;
