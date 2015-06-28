"use strict";

var path = require("path"),
  webpack = require("webpack"),
  execFileSync = require("child_process").execFileSync;

/**
 * @param {Object} options
 * @param {Array.<String>} options.moduleEntryPoints js modules that serve as entry points to the generated webpack bundle
 * @param {String} options.outputModuleName name of the outputted module that represents the moduleEntryPoints
 * @param {String} options.outputPath absolute path to folder where module should be written, if necessary
 * @param {String} options.outputFilename filename or filename pattern of module that should be written
 * @param {String} options.outputChunkFilename name of chunk files that are written
 * @param {Boolean} options.enableSourceMaps
 * @param {Boolean} options.isProductionBundle
 * @param {Boolean} options.isRunningTests
 * @param {Boolean} options.isLintingCode
 * @param {Boolean} options.isGeneratingCoverage
 * @param {Boolean} options.isHotReloading
 * @returns {Object} webpack configuration object
 */
function configureWebpack(options) {
  var currentGitUser,
    entryPoints,
    config = {
      module: {
        preLoaders: [],
        loaders: [],
        postLoaders: []
      },
      plugins: []
    };

  try {
    currentGitUser = execFileSync("git", [ "config", "user.name" ]).toString("utf-8").trim();
  }
  catch(e) {
    console.log("Was unable to determine the current git user.name");
  }

  if(options.outputModuleName && options.moduleEntryPoints) {
    config.entry = {
    };

    entryPoints = options.moduleEntryPoints;
    if(options.isHotReloading) {
      entryPoints = [ "webpack/hot/dev-server" ].concat(entryPoints);
    }

    config.entry[ options.outputModuleName ] = entryPoints;
  }

  if(options.outputPath || options.outputFilename || options.outputChunkFilename) {
    config.output = {};

    if(options.outputPath) {
      config.output.path = options.outputPath;
    }

    if(options.outputFilename) {
      config.output.filename = options.outputFilename;
    }

    if(options.outputChunkFilename) {
      config.output.chunkFilename = options.outputChunkFilename;
    }
  }

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
    config.module.preLoaders.push({
      // include .js files
      // exclude any and all files in the node_modules folder
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "jshint-loader"
    });
    config.module.preLoaders.push({
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "jscs-loader"
    });

    config.jscs = {
      emitErrors: true,
      maxErrors: 50,
      verbose: true,

      // fail the build if we're making a production bundle and a violation occurs
      failOnHint: options.isProductionBundle
    };
  }

  config.module.loaders.push(
    /* .ejs : precompiled lodash template */
    { test: /\.ejs$/, loader: "ejs" }
  );

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
              (options.isProductionBundle ? "compressed" : "expanded") + "&includePaths[]=" +
              path.resolve(__dirname, "./node_modules")
    });
  }

  if(options.isGeneratingCoverage) {
    config.module.postLoaders.push({ // << add subject as webpack's postloader
      test: /\/([a-zA-Z0-9_]+)\.js$/,
      exclude: /(node_modules)\//,
      loader: "istanbul-instrumenter"
    });
  }

  // configure plugins

  if(options.isHotReloading) {
    config.dist = {
      cache: false
    };

    // first thing in plugins list is the HotModuleReplacementPlugin if we're running in hotReloading mode
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  config.plugins.push(new webpack.ProvidePlugin({
    /* make lodash available to all modules */
    _: "lodash",
    featureFlags: path.resolve(__dirname, "./lib/featureFlags")
  }));

  config.plugins.push(new webpack.DefinePlugin({
    PRODUCTION_MODE: options.isProductionBundle,
    GIT_USERNAME: JSON.stringify(currentGitUser)
  }));

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
