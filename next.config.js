const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: config => {
    config.resolve.alias['~'] = path.resolve(__dirname);
    return config;
  },
  env: {
    SITE_BASE_URL_DEV: process.env.SITE_BASE_URL_DEV,
    SITE_BASE_URL: process.env.SITE_BASE_URL,
  },
};
