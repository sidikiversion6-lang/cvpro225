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
      {
        source: '/services/visa-check',
        destination: 'https://visaguinee.com',
        permanent: true,
      },
      {
        source: '/services/visa-check/:path*',
        destination: 'https://visaguinee.com',
        permanent: true,
      },
      {
        source: '/visa',
        destination: 'https://visaguinee.com',
        permanent: true,
      },
      {
        source: '/visa/:path*',
        destination: 'https://visaguinee.com',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
