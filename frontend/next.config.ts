/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://15.135.233.82/api/v1',
  },

  // Bỏ qua TypeScript errors khi build (fix sau)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Bỏ qua ESLint errors khi build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig