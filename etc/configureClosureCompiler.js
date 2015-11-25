/*
 Kidcompy - a virtual computer for kids
 Copyright (C) 2015  Woldrich, Inc.

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

var path = require("path"),
  fs = require("fs"),
  URI = require("urijs"),
  computeDefinedConstants = require("./computeDefinedConstants");

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

/**
 * Build the closure compiler config object
 *
 * @param {string} projectRoot absolute path to the root folder for this project
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
function configureClosureCompiler(projectRoot, options) {
  var i, ii,
    constants = computeDefinedConstants(options),
    constantName,
    constantValue,
    constantValueType,
    absoluteSourceFolder = path.resolve(options.sourceFolder),
    absoluteTargetFolder = path.resolve(options.targetFolder),
    constantsOut,
    constantNamespaces,
    groups,
    config,
    sourceMapLocationMappings = [],
    sourceFileUri;

  for(i = 0, ii = options.sourceFiles.length; i < ii; i++) {
    sourceFileUri = new URI(options.sourceFiles[i]);
    sourceMapLocationMappings.push(options.sourceFiles[i] + "|" + path.relative(options.sourceFiles[i], projectRoot));
  }

  config = {
    compilerPath: path.resolve(__dirname, "./closureCompiler/compiler.jar"),
    fileName: options.outputFile,
    minifiedFileName: options.minifiedFile,
    compilerFlags: {
      charset: "UTF-8",
      compilation_level: "ADVANCED_OPTIMIZATIONS",
      language_in: "ECMASCRIPT6_STRICT",
      language_out: "ECMASCRIPT3",
      manage_closure_dependencies: null,
      process_common_js_modules: null,
      common_js_entry_module: path.resolve(options.sourceFiles[0]),
      common_js_module_path_prefix: path.resolve(__dirname),
      create_source_map: options.outputFile + ".map",
      source_map_location_mapping: sourceMapLocationMappings,
      jscomp_off: "deprecatedAnnotations",
      use_types_for_optimization: null,
      warning_level: "VERBOSE",
      formatting: "PRETTY_PRINT",
      extra_annotation_name: ["module" ,"namespace", "category", "alias"],
      output_wrapper: "\"(function(){%output%}).call(window);//# sourceMappingURL=" + options.outputFile + ".map\"",
      externs: [ path.resolve("./lib/externs.js"),
                 path.resolve("./lib/testingExterns.js"),
                 path.resolve("./lib/constantExterns.js") ]
    }
  };

  // build a dynamic externs constants.js file that the closure compiler can use to protect our constant symbols from
  // being elided or mangled
  constantsOut = "/**\n" +
                 " * GENERATED FILE - Do not add to source control.  Used to declare kidcompy's constant symbols as\n" +
                 " * externs to the Closure Compiler so they are protected from mangling.  UglifyJS2 is used on\n" +
                 " * Closure Compiler's output to do the actual constant symbol substitutions and do the dead code\n" +
                 " * removal on any blocks that should be elided as a result of those substitutions.\n" +
                 " *\n" +
                 " * @externs\n" +
                 " */\n\n" +
                 "// jshint -W079\n" +
                 "// jshint -W098\n" +
                 "// jscs:disable requireMultipleVarDecl\n\n";

  constantNamespaces = {};
  for(constantName in constants) {
    if(constants.hasOwnProperty(constantName)) {
      constantValue = constants[constantName];
      constantValueType = typeof JSON.parse(constantValue);

      // make constantValue truthy just in case Closure Compiler ever does something with it
      if(constantValueType === "boolean") {
        constantValue = true;
      }
      else if(constantValueType === "number") {
        constantValue = 1;
      }

      groups = /([^\.]*)\.(.*)/i.exec(constantName);
      if(groups) {
        if(typeof constantNamespaces[groups[1]] === "undefined") {
          constantsOut += "/** @namespace */\n";
          constantsOut += "var " + groups[1] + " = {};\n\n";
          constantNamespaces[groups[1]] = true;
        }

        constantsOut += "/**\n" +
                        " * @see {@link featureFlagDefinitions." + groups[2] + "} for flag description\n" +
                        " * @type {" + constantValueType + "}\n" +
                        " */\n";
        constantsOut += constantName + " = " + constantValue + ";\n";
      }
      else {
        constantsOut += "/**\n" +
                        " * @see {@link featureFlagDefinitions." + constantName + "} for flag description\n" +
                        " * @type {" + constantValueType + "}\n" +
                        " */\n";
        constantsOut += "var " + constantName + " = " + constantValue + ";\n";
      }
    }
  }

  fs.writeFileSync(path.resolve("./lib/constantExterns.js"), constantsOut);

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
