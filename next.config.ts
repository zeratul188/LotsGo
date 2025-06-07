import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  swcMinify: true,
  compiler: {
    // ssr, displayName true가 기본값으로 켜진다.
    styledComponents: true,
  },
  images: {
      domains: ['firebasestorage.googleapis.com', 'api.qrserver.com', 'cdn-lostark.game.onstove.com'],
      formats: ['image/avif', 'image/webp']
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    return config;
  }
};

export default nextConfig;
