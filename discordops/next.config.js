/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Discord CDN avatars / icons
    remotePatterns: [{ protocol: "https", hostname: "cdn.discordapp.com" }],
  },
};

module.exports = nextConfig;
