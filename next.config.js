/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Externalize puppeteer packages for serverless to reduce bundle size
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
};

module.exports = nextConfig;
