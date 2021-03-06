const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: config => {
    config.resolve.alias['~'] = path.resolve(__dirname);
    return config;
  },
  env: {
    APP_URL: process.env.NODE_ENV === 'production' ? process.env.APP_URL : process.env.SITE_BASE_URL_DEV,
    MONGO_DB_URI: process.env.MONGO_DB_URI,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },
};
