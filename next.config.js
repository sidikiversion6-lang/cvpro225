/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cvpro225.com' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'pdfjs-dist'],
    // instrumentation.ts : purge quotidienne des CV stockés (lib/cv-purge.ts)
    instrumentationHook: true,
  },
  async redirects() {
    return [
      {
        source: '/services/tender-pro',
        destination: '/tarifs',
        permanent: true,
      },
      {
        source: '/services/tender-pro/:path*',
        destination: '/tarifs',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
