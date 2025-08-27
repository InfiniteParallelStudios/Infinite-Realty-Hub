/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal config to prevent compilation errors
  reactStrictMode: false,
  // Add cache-busting headers to prevent browser caching issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
  webpack: (config, { dev, isServer }) => {
    // Force webpack instead of turbopack
    return config
  }
}

module.exports = nextConfig