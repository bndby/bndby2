/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Современные настройки для Next.js 15
  poweredByHeader: false,
  compress: true,
  trailingSlash: true,
};

export default nextConfig;
