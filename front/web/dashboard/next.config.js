/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'dist',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.kanjiup.alexandre-em.fr',
        port: '',
        pathname: '/kanjiup/**/**',
      },
    ],
  },
};

module.exports = nextConfig;
