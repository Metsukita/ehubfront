// client/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Adicione este bloco de código
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        port: '',
        pathname: '/**',
      },
      
    ],
  },
};

export default nextConfig;