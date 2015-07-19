"use strict";

/* jscs: disable */

var path = require("path"),
  webpack = require("webpack"),
  execFileSync = require("child_process").execFileSync;

/**
 * @param {Object} options
 * @param {Array.<string>} options.moduleEntryPoints js modules that serve as entry points to the generated webpack bundle
 * @param {string} options.outputModuleName name of the outputted module that represents the moduleEntryPoints
 * @param {string} options.outputPath absolute path to folder where module should be written, if necessary
 * @param {string} options.outputFilename filename or filename pattern of module that should be written
 * @param {string} options.outputChunkFilename name of chunk files that are written
 * @param {boolean} [options.emitSingleChunk=false] when true, all chunks are merged into a single output file.  When
 *        false, more than one JavaScript chunk file may be emitted if webpack wants
 * @param {boolean} options.enableSourceMaps
 * @param {boolean} options.isProductionBundle
 * @param {boolean} options.isRunningTests
 * @param {boolean} options.isLintingCode
 * @param {boolean} options.isGeneratingCoverage
 * @param {boolean} options.isHotReloading
 * @returns {Object} webpack configuration object
 */
function configureWebpack(options) {
  var currentGitUser,
    entryPoints,
    providedModules,
    definedConstants,
    featureFlags,
    featureFlag,
    featureFlagSummary,
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
      config.devtool = "source-map";
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
      loader: "style!css!sass?outputStyle=expanded&includePaths[]=" + path.resolve(__dirname, "../node_modules")
    });
  }
  else {
    /* .scss : SASS file encoded into standalone CSS with a hash query string generated in the referencing scripts */
    config.module.loaders.push({
      test: /\.scss$/,
      loader: "style/url?limit=0!file?name=css/[name].css?[hash]!sass?outputStyle=" +
              (options.isProductionBundle ? "compressed" : "expanded") + "&includePaths[]=" +
              path.resolve(__dirname, "../node_modules")
    });
  }

  if(options.isGeneratingCoverage) {
    config.module.postLoaders.push({
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

  // map of local variable name to module name that are auto-require'd into all modules in the bundle
  providedModules = {
    _: "lodash",
    exportGlobal: path.resolve(__dirname, "../lib/export/exportSymbol"),
    exportPrototypeProperties: path.resolve(__dirname, "../lib/export/exportPrototypeProperties"),
    exportStaticProperties: path.resolve(__dirname, "../lib/export/exportStaticProperties")
  };

  if(!options.isProductionBundle) {
    // featureFlags is an actual object in development mode that is auto-require'd using the ProvidePlugin
    providedModules.featureFlags = path.resolve(__dirname, "../featureFlags");
  }

  config.plugins.push(new webpack.ProvidePlugin(providedModules));

  if(options.emitSingleChunk) {
    config.plugins.push(new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }));
  }

  definedConstants = {
    PRODUCTION_MODE: JSON.stringify(options.isProductionBundle),
    GIT_USERNAME: JSON.stringify(currentGitUser)
  };

  if(options.isProductionBundle) {
    // get the featureFlags and regenerate them, if needed
    featureFlags = require(path.resolve(__dirname, "../featureFlags"));
    featureFlags.generateFeatureFlags(options.isProductionBundle, currentGitUser);
    featureFlagSummary = {};

    // Feature flags are defined as constants in the production build so that they can be used to elide disabled
    // features by-way of the UglifyJsPlugin that follows
    for(featureFlag in featureFlags) {
      if(featureFlags.hasOwnProperty(featureFlag)) {
        if(typeof featureFlags[featureFlag] !== "function") {
          definedConstants["featureFlags." + featureFlag] = JSON.stringify(featureFlags[featureFlag]);
          featureFlagSummary[featureFlag] = featureFlags[featureFlag];
        }
      }
    }

    // Make a constant out of the feature flags so that we can dump them for debugging purposes in production mode
    // builds.  There is a similar global FEATURE_FLAGS variable object in development-mode builds that can be used
    // in the same way as this constant.
    definedConstants.FEATURE_FLAGS = JSON.stringify(featureFlagSummary);
  }

  config.plugins.push(new webpack.DefinePlugin(definedConstants));

  // Closure compiler is our minifier in production mode builds, but there are aspects to the webpack bundles that
  // Closure Compiler chokes on.  This UglifyJsPlugin does some light post-processing compression on the output bundle
  // that has the effect of eliding code blocks that have been disabled by feature flags.  This gets Closure Compiler
  // past the Webpack-generated trouble spots.
  if(options.isProductionBundle) {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        properties: false,
        negate_iife: false
      },

      // Closure Compiler will take care of mangling
      mangle: false,

      // preserve all the comments so that the jsdoc's are fed to Closure Compiler
      comments: "all"
    }));
  }

  return config;
}

module.exports = configureWebpack;
