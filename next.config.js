/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Современные настройки для Next.js 15
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
