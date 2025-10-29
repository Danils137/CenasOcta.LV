const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Simple configuration to ensure tslib is found
const config = getDefaultConfig(__dirname);
config.resolver.alias = {
  tslib: require.resolve('tslib'),
};

module.exports = withNativeWind(config, { input: './global.css' });
