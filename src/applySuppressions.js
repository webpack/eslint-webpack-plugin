const fs = require("node:fs");
const { dirname, isAbsolute, resolve } = require("node:path");

/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/** @typedef {import('./options').Options} Options */
/**
 * @typedef {Record<string, Record<string, { count: number }>>} SuppressedViolations
 * @typedef {new (options: { filePath: string, cwd: string }) => { load: () => Promise<SuppressedViolations>, applySuppressions: (results: LintResult[], suppressions: SuppressedViolations) => { results: LintResult[], unused: SuppressedViolations } }} SuppressionsService
 */

/**
 * Try to load SuppressionsService from ESLint..
 * Returns null if not available, e.g. older ESLint versions.
 * @returns {SuppressionsService | null} SuppressionsService instance or null
 */
function getSuppressionsService() {
  // ESLint doesn't export SuppressionsService in package.json exports,
  // so we need to resolve the path directly
  const eslintPath = require.resolve("eslint");
  const eslintDir = eslintPath.replace(/\/lib\/api\.js$/, "");

  try {
    const { SuppressionsService } = require(
      `${eslintDir}/lib/services/suppressions-service.js`,
    );

    return SuppressionsService;
  } catch {
    return null;
  }
}

/**
 * @param {LintResult[]} results results
 * @param {Options} options options
 * @returns {Promise<LintResult[]>} suppressed results
 */
async function applySuppressions(results, options) {
  const SuppressionsService = getSuppressionsService();
  if (!SuppressionsService) {
    return results;
  }

  const { context } = options;
  if (!context) {
    return results;
  }

  const suppressionsLocation =
    options.suppressionsLocation || "eslint-suppressions.json";
  const filePath = isAbsolute(suppressionsLocation)
    ? suppressionsLocation
    : resolve(context, suppressionsLocation);

  // Only apply suppressions if the file exists
  if (!fs.existsSync(filePath)) {
    return results;
  }

  // cwd must be the directory containing the suppressions file,
  // since paths in the file are relative to that location
  const suppressionsCwd = dirname(filePath);

  const suppressions = new SuppressionsService({
    filePath,
    cwd: suppressionsCwd,
  });

  try {
    const suppressionData = await suppressions.load();
    const { results: filteredResults } = suppressions.applySuppressions(
      results,
      suppressionData,
    );
    return filteredResults;
  } catch {
    // Return original results if loading/applying suppressions fails
    return results;
  }
}

module.exports = applySuppressions;
