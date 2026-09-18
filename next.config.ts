import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/map.html',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/bookings',
        destination: '/my-bookings',
        permanent: true,
      },
      {
        source: '/escrow',
        destination: '/escrow-clearing',
        permanent: true,
      },
      {
        source: '/telemetry',
        destination: '/telemetry-oracle',
        permanent: true,
      },
      {
        source: '/registry',
        destination: '/operator-registry',
        permanent: true,
      },
      {
        source: '/api-engine',
        destination: '/api-smart-contract',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
