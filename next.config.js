/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add or modify the images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com', // This hostname seems correctly listed
        port: '', // Optional: usually empty for standard HTTPS (port 443)
        pathname: '/imtusharrai/heart-to-heart/**', // Optional: be more specific if needed
      },
      // Add other domains if you host images elsewhere
    ],
  },
  // ... any other existing configurations
};

module.exports = nextConfig; // Or export default for .mjs