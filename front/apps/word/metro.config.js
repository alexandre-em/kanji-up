// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

const sourceExts = config.resolver.sourceExts ?? [];
config.resolver.sourceExts = [...sourceExts, 'mp3', 'tflite', 'mjs', 'wav'];
const assetExts = config.resolver.assetExts ?? [];
config.resolver.assetExts = [...assetExts, 'mp3', 'tflite', 'mjs', 'wav'];

module.exports = config;
