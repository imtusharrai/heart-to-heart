/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add the images configuration block
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/imtusharrai/heart2heart/main/public/**', // Be specific if possible
      },
      // Add other domains if you host images elsewhere
    ],
  },
  // ... any other existing configurations
};

module.exports = nextConfig; // Or export default for .mjs