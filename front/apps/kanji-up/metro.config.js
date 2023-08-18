// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const defaultAssetExts = require('metro-config/src/defaults/defaults').assetExts;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

const assetsExts = config.resolver.assetsExts ?? [];
config.resolver.assetsExts = [...defaultAssetExts, 'bin', 'tflite', 'cjs', 'mjs'];

module.exports = config;
