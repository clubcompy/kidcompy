"use strict";

var path = require("path"),
  fs = require("fs"),
  computeDefinedConstants = require("./computeDefinedConstants");

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

/**
 * Build the closure compiler config object
 *
 * @param {Object} options
 * @param {boolean} options.isProductionBundle
 * @param {boolean} options.areBundlesSplit
 * @param {Array.<string>} options.sourceFiles source files
 * @param {Array.<string>} options.sourceFolder the folder for the file in options.sourceFiles[0]
 * @param {string} options.targetFolder destination folder to write files out to
 * @param {string?} options.sourceMap closure compiler source map if there is one
 * @param {string} options.outputFile intermediate file saved to options.targetFolder that will host the closure
 *        compiler output javascript bundle file
 * @param {string} options.minifiedFile file saved to options.targetFolder that will host the final minified script
 *        built from options.outputFile
 * @returns {Object} closure compiler config object for the gulp-closure-compiler
 */
function configureClosureCompiler(options) {
  var i, ii,
    constants = computeDefinedConstants(options),
    constantName,
    constantValue,
    absoluteSourceFolder = path.resolve(options.sourceFolder),
    absoluteTargetFolder = path.resolve(options.targetFolder),
    constantsOut,
    constantNamespaces,
    groups,
    config;

  config = {
    compilerPath: path.resolve(__dirname, "./closureCompiler/compiler.jar"),
    fileName: options.outputFile,
    minifiedFileName: options.minifiedFile,
    compilerFlags: {
      charset: "UTF-8",
      compilation_level: "ADVANCED_OPTIMIZATIONS",
      language_in: "ECMASCRIPT5_STRICT",
      language_out: "ECMASCRIPT3",
      manage_closure_dependencies: null,
      transform_amd_modules: null,
      process_common_js_modules: null,
      common_js_entry_module: path.resolve(options.sourceFiles[0]),
      create_source_map: options.outputFile + ".map",
      jscomp_off: "deprecatedAnnotations",
      use_types_for_optimization: null,
      warning_level: "VERBOSE",
      extra_annotation_name: ["@module" ,"@namespace" ],
      output_wrapper: "(function(){%output%}).call(window);//# sourceMappingURL=" + options.outputFile + ".map",
      externs: [ path.resolve("./lib/externs.js"),
                 path.resolve("./lib/testingExterns.js"),
                 path.resolve("./intermediate/constants.js") ]
    }
  };

  // copy in all the defined constants as --define parameters
  constantsOut = "/** @externs */\n\n";
  constantNamespaces = {};
  for(constantName in constants) {
    if(constants.hasOwnProperty(constantName)) {
      constantValue = constants[constantName];

      groups = /([^\.]*)\..*/i.exec(constantName);
      if(groups) {
        if(typeof constantNamespaces[groups[1]] === "undefined") {
          constantsOut += "/** @namespace */\n";
          constantsOut += "var " + groups[1] + " = {};\n";
          constantNamespaces[groups[1]] = true;
        }

        constantsOut += constantName + " = " + constantValue + ";\n";
      }
      else {
        constantsOut += "var " + constantName + " = " + constantValue + ";\n";
      }
    }
  }

  fs.writeFileSync(path.resolve("./intermediate/constants.js"), constantsOut);

  // make all the source files relative paths to the target folder
  config.sourceFiles = [];
  for(i = 0, ii = options.sourceFiles.length; i < ii; i++) {
    config.sourceFiles.push(path.resolve(options.sourceFiles[i]));
  }

  // tack on the closure library base.js so that closureCompiler has the goog symbol it requires
  config.sourceFiles.push(path.resolve("./etc/closureCompiler/closure-library-master/closure/goog/base.js"));

  config.sourceFolder = absoluteSourceFolder;
  config.targetFolder = absoluteTargetFolder;

  // if there was a source map for the incoming JS, tack it onto the config
  if(options.sourceMap) {
    config.source_map_input = options.sourceMap;
  }

  return config;
}

module.exports = configureClosureCompiler;
