const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// Importante para pnpm/monorepo:
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;