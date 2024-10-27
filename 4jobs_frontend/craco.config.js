const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ensure no fallback property is present
      delete webpackConfig.resolve.fallback; // Remove if it exists
      return webpackConfig;
    },
  },
};
