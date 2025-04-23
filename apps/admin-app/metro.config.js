// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.watchFolders = [__dirname + '/../../']; // if you have shared code
config.resolver.assetExts.push("ttf");
module.exports = config;
module.exports = withNativeWind(config, { input: "./global.css" });