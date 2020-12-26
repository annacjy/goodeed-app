const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: config => {
    config.resolve.alias['~'] = path.resolve(__dirname);
    return config;
  },
  env: {
    APP_URL: process.env.NODE_ENV === 'production' ? process.env.APP_URL : process.env.SITE_BASE_URL_DEV,
    DATABASE_URL: process.env.DATABASE_URL,
  },
};
