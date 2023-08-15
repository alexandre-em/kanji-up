// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

const assetsExts = config.resolver.assetsExts ?? [];
config.resolver.assetsExts = [...assetsExts, 'bin', 'tflite'];

module.exports = config;
