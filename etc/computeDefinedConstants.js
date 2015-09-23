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
  execFileSync = require("child_process").execFileSync,
  packageJson = require("../package.json");

/**
 * Spawn a git subprocess to retrieve the current git user name
 *
 * @returns {string}
 */
function fetchCurrentGitUserName() {
  var currentGitUser;

  try {
    currentGitUser = execFileSync("git", ["config", "user.name"]).toString("utf-8").trim();
  }
  catch(e) {
    console.log("Unable to determine the current git user.name, you may need to set it on this system.  Using 'anonymous'");
    currentGitUser = "anonymous";
  }

  return currentGitUser;
}

/**
 * Compute the defined constants that will be used in the build based on options and the caller's environment
 *
 * @param {{ isProductionBundle: boolean, areBundlesSplit: boolean  }} options
 * @returns {Object} computed defined constants
 */
function computeDefinedConstants(options) {
  var featureFlagModule,
    featureFlagSummary,
    featureFlag,
    currentGitUser,
    definedConstants;

  currentGitUser = fetchCurrentGitUserName();

  definedConstants = {
    "PRODUCTION_MODE": JSON.stringify(options.isProductionBundle),
    "SPLIT_BUNDLES": JSON.stringify(options.areBundlesSplit),
    "GIT_USERNAME": JSON.stringify(currentGitUser),
    "BUILD_VERSION": JSON.stringify(packageJson.version)
  };

  // get the featureFlags and regenerate them using our isProduction flag and caller's git user name
  featureFlagModule = require(path.resolve(__dirname, "../lib/featureFlags"));
  featureFlagSummary = featureFlagModule.generateFeatureFlags(options.isProductionBundle, currentGitUser);

  // In the production build, feature flags are parsed in-place here and defined as constant booleans that are used to
  // totally elide disabled features by-way of the Closure Compiler that follows after the webpack bundle is generated
  for(featureFlag in featureFlagModule) {
    if(featureFlagModule.hasOwnProperty(featureFlag) && typeof featureFlagModule[featureFlag] !== "function") {
      definedConstants["featureFlags." + featureFlag] = JSON.stringify(featureFlagModule[featureFlag]);
    }
  }

  return definedConstants;
}

module.exports = computeDefinedConstants;
