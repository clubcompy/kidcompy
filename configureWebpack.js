"use strict";

var path = require("path"),
  webpack = require("webpack");

/**
 * @param {Object} options
 * @param {Boolean} options.enableSourceMaps
 * @param {Boolean} options.isProductionBundle
 * @param {Boolean} options.isRunningTests
 * @param {Boolean} options.isLintingCode
 * @returns {Object} webpack configuration object
 */
function configureWebpack(options) {
  var config = {
    module: {}
  };

  if(options.enableSourceMaps) {
    if(options.isRunningTests) {
      // webpack configuration -- eval is the fast method of getting sourcemap info into the sources, but
      // we probably won't do sourcemaps at all as part of our production packaging since we're going to mangle
      config.devtool = "eval";
    }
    else {
      config.devtool = options.isProductionBundle ? "hidden-source-map" : "source-map";
    }
  }

  if(options.isLintingCode) {
    config.module.preLoaders = [
      {
        // include .js files
        // exclude any and all files in the node_modules folder
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "jshint-loader"
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "jscs-loader"
      }
    ];

    config.jscs = {
      emitErrors: true,
      maxErrors: 50,
      verbose: true
    };
  }

  config.module.loaders = [
    /* .ejs : precompiled lodash template */
    { test: /\.ejs$/, loader: "ejs" }
  ];

  // the SASS loader in test mode simply bundles the SASS into the script.  Non-test builds emit them to standalone CSS
  if(options.isRunningTests) {
    /* .scss : SASS file encoded into scripts that can be reloaded */
    config.module.loaders.push({
      test: /\.scss$/,
      loader: "style!css!sass?outputStyle=expanded&includePaths[]=" + path.resolve(__dirname, "./node_modules")
    });
  }
  else {
    /* .scss : SASS file encoded into standalone CSS with a hash query string generated in the referencing scripts */
    config.module.loaders.push({
      test: /\.scss$/,
      loader: "style/url?limit=0!file?name=css/[name].css?[hash]!sass?outputStyle=" +
              (options.isProductionBundle ? "compressed" : "expanded") + "&includePaths[]=" + path.resolve(__dirname, "./node_modules")
    });
  }

  config.plugins = [
    new webpack.ProvidePlugin({
      /* make lodash available to all modules */
      _: "lodash"
    })
  ];

  // want to minify the final JS bundle if we're in production mode
  if(options.isProductionBundle) {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },

      mangle: {
        except: [ "_", "exports", "require" ]
      }
    }));
  }

  return config;
}

module.exports = configureWebpack;
