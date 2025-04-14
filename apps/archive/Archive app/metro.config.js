const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, "../../"); // ← your monorepo root

const config = getDefaultConfig(projectRoot);

// Watch workspace packages
config.watchFolders = [workspaceRoot];

// Support symlinked packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./global.css" });