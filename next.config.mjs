import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'miaoda-site-img.s3cdn.medo.dev',
      },
      {
        protocol: 'https',
        hostname: 'miaoda-conversation-file.s3cdn.medo.dev',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
    ],
    unoptimized: true,
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': path.resolve(__dirname, './src'),
    };
    return config;
  },
};

export default nextConfig;
