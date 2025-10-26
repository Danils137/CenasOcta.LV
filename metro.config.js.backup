const { getDefaultConfig } = require('expo/metro-config');

// Simple configuration to ensure tslib is found
const config = getDefaultConfig(__dirname);
config.resolver.alias = {
  tslib: require.resolve('tslib'),
};

module.exports = config;
