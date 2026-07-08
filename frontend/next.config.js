/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Image configuration
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    minimumCacheTTL: process.env.NODE_ENV === 'development' ? 0 : 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.sspms.internal',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'app.sspms.internal',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'supplier.sspms.internal',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Disable X-Powered-By header
  poweredByHeader: false,

  // Logging configuration for development
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Configure headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      ...(process.env.NODE_ENV === 'development'
        ? [
          {
            source: '/images/:path*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'no-cache, no-store, must-revalidate, max-age=0',
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
          {
            source: '/_next/image/:path*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'no-cache, no-store, must-revalidate, max-age=0',
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
        : []),
    ];
  },

  // Turbopack configuration
  turbopack: {
    // Enable detailed logging for turbopack
    // Add any Turbopack-specific configuration here
  },

  // Development-specific settings
  ...(process.env.NODE_ENV === 'development' && {
    generateBuildId: async () => 'development-' + Date.now(),
    allowedDevOrigins: ['app.sspms.internal', 'localhost', '*.sspms.internal'],
    // Enable verbose logging
    logging: {
      level: 'verbose',
      fetches: {
        fullUrl: true,
      },
    },
  }),
};

export default nextConfig;
