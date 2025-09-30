import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.githubassets.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pulse-app-files.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        "osx-temperature-sensor": "commonjs osx-temperature-sensor",
      });
    } else {
      config.resolve.alias["osx-temperature-sensor"] = false;
    }
    config.cache = false; // disable file-system caching in Docker
    return config;
  },
};

export default nextConfig;
