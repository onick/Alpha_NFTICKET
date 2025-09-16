const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

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
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  env: {
    ANALYZE: process.env.ANALYZE || 'false',
    TIPTAP_PERFORMANCE_MONITORING: process.env.TIPTAP_PERFORMANCE_MONITORING || 'false',
    TIPTAP_OPTIMIZATION_LEVEL: process.env.TIPTAP_OPTIMIZATION_LEVEL || 'basic',
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize TipTap bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Bundle splitting optimization
        '@tiptap/core': '@tiptap/core',
        '@tiptap/react': '@tiptap/react',
      }
    }

    return config
  },
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['@tiptap/core', '@tiptap/react', '@tiptap/starter-kit'],
  },
};

module.exports = withBundleAnalyzer(nextConfig);