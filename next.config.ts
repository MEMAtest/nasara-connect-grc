import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer, webpack: wp }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        https: false,
        http: false,
      };
      // Strip node: prefix so fallbacks above can handle them
      config.plugins.push(
        new wp.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async redirects() {
    return [
      {
        source: "/log-in",
        destination: "/auth/login",
        permanent: true,
      },
      {
        source: "/fos-scraper",
        destination: "/tools/fos-scraper",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
