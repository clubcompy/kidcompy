"use strict";

/* jscs: disable */

var path = require("path"),
  webpack = require("webpack"),

  computeDefinedConstants = require("./computeDefinedConstants");

function configureOptionalEntryPoints(config, options) {
  if(options.outputModuleName && options.moduleEntryPoints) {
    config.entry = {};

    var entryPoints = options.moduleEntryPoints;
    if(options.isHotReloading) {
      entryPoints = ["webpack/hot/dev-server"].concat(entryPoints);
    }

    config.entry[options.outputModuleName] = entryPoints;
  }
}

function configureOptionalOutputPath(config, options) {
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
}
function configureOptionalSourceMapGeneration(config, options) {
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
}

function configureOptionalCodeLinters(config, options) {
  if(options.isLintingCode) {
    config.module.preLoaders.push({
      // include .js files
      // exclude any and all files in the node_modules folder
      test: /\.js$/,
      exclude: /(node_modules|firebug-lite)/,
      loader: "jshint-loader"
    });
    config.module.preLoaders.push({
      test: /\.js$/,
      exclude: /(node_modules|firebug-lite)/,
      loader: "jscs-loader"
    });

    config.jshint = {
      // fail the build and emit as errors if we're making a production bundle and a violation occurs
      emitErrors: options.isProductionBundle,
      failOnHint: options.isProductionBundle
    };

    config.jscs = {
      maxErrors: 50,
      verbose: true,

      // fail the build and emit as errors if we're making a production bundle and a violation occurs
      emitErrors: options.isProductionBundle,
      failOnHint: options.isProductionBundle
    };
  }
}

function configureCustomModuleLoaders(config, options) {
  config.module.loaders.push(
    /* .ejs : precompiled lodash template */
    {test: /\.ejs$/, loader: "ejs"}
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
}

function configureOptionalTestCodeCoverageMeasurement(config, options) {
  if(options.isGeneratingCoverage) {
    config.module.postLoaders.push({
      test: /\/([a-zA-Z0-9_]+)\.js$/,
      exclude: /(node_modules)\//,
      loader: "istanbul-instrumenter"
    });
  }
}

function configureWebpackPlugins(config, options) {
  var providedModules,
    definedConstants;

  //
  // HotModuleReplacementPlugin
  //

  if(options.isHotReloading) {
    config.dist = {
      cache: false
    };

    // first thing in plugins list is the HotModuleReplacementPlugin if we're running in hotReloading mode
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
  }


  //
  // ProvidePlugin - auto registers modules into all require'd modules on-demand
  //

  // map of local variable name to module name that are auto-require'd into all modules in the bundle
  providedModules = {
    _: "lodash"
  };

  config.plugins.push(new webpack.ProvidePlugin(providedModules));


  //
  // LimitChunkCountPlugin - forces webpack to emit only a single JS bundle file
  //

  if(options.emitSingleChunk) {
    config.plugins.push(new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }));
  }


  //
  // DefinePlugin - Defines constants that may be used in require'd modules, used to
  //                provide build constants and feature flag summary to the build
  //

  definedConstants = computeDefinedConstants(options);
  config.plugins.push(new webpack.DefinePlugin(definedConstants));


  //
  // UglifyJsPlugin - Minification and obfuscation for webpack.
  //

  if(options.isProductionBundle) {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
      // this list of compress flags is tuned to minify as much as IE6-IE8 can tolerate
      compress: {
        warnings: false,
        properties: false,
        negate_iife: false,
        screw_ie8: false,
        drop_console: true      // always drop raw console.log calls to be friendly to legacy IE
      },

      // mangle for great justice
      mangle: true
    }));
  }
  else {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        sequences: false,
        properties: false,
        dead_code: true,
        drop_debugger: false,   // leave debugger flags in for development mode
        unsafe: false,
        conditionals: false,
        comparisons: false,
        evaluate: false,
        booleans: false,
        loops: false,
        unused: false,
        hoist_funs: false,
        hoist_vars: false,
        if_return: false,
        join_vars: false,
        cascade: false,
        warnings: false,
        negate_iife: false,
        pure_getters: false,
        pure_funcs: null,
        drop_console: true,     // always drop raw console.log calls to be friendly to legacy IE
        keep_fargs: false,
        keep_fnames: true
      },

      // don't drop any comments in developer mode
      comments: "all",

      // don't mangle in developer mode
      mangle: false
    }));
  }
}

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
 * @param {boolean} options.areBundlesSplit
 * @param {boolean} options.isRunningTests
 * @param {boolean} options.isLintingCode
 * @param {boolean} options.isGeneratingCoverage
 * @param {boolean} options.isHotReloading
 * @returns {Object} webpack configuration object
 */
function configureWebpack(options) {
  var config = {
      module: {
        preLoaders: [],
        loaders: [],
        postLoaders: []
      },
      plugins: []
    };

  configureOptionalEntryPoints(config, options);
  configureOptionalOutputPath(config, options);
  configureOptionalSourceMapGeneration(config, options);
  configureOptionalCodeLinters(config, options);
  configureCustomModuleLoaders(config, options);
  configureOptionalTestCodeCoverageMeasurement(config, options);
  configureWebpackPlugins(config, options);

  return config;
}

module.exports = configureWebpack;
