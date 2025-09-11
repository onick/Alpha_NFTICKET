/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@nfticket/ui',
    '@nfticket/api',
    '@nfticket/blockchain',
    '@nfticket/cache',
    '@nfticket/i18n',
  ],
  images: {
    domains: ['supabase.co', 'supabase.in'],
  },
};

module.exports = nextConfig;