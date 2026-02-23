/** @typedef {import("eslint").ESLint} ESLint */
/** @typedef {import("eslint").ESLint.Options} ESLintOptions */
/** @typedef {import("eslint").ESLint.LintResult} LintResult */
/** @typedef {{ new (arg0: ESLintOptions): ESLint, outputFixes: (arg0: LintResult[]) => any }} ESLintClass */

/** @type {ESLintClass} */
let ESLint;

/** @type {ESLint} */
let eslint;

/** @type {boolean} */
let fix;

/**
 * @param {object} options setup worker
 * @param {string=} options.eslintPath import path of eslint
 * @param {string=} options.configType a config type
 * @param {ESLintOptions} options.eslintOptions linter options
 * @returns {ESLint} eslint
 */
function setup({ eslintPath, configType, eslintOptions }) {
  fix = Boolean(eslintOptions && eslintOptions.fix);

  const eslintModule = require(eslintPath || "eslint");

  if (
    eslintModule.ESLint &&
    Number.parseFloat(eslintModule.ESLint.version) >= 9
  ) {
    return eslintModule
      .loadESLint({ useFlatConfig: configType === "flat" })
      .then((/** @type {ESLintClass} */ classESLint) => {
        ESLint = classESLint;
        eslint = new ESLint(eslintOptions);
        return eslint;
      });
  }

  let FlatESLint;

  if (eslintModule.LegacyESLint) {
    ESLint = eslintModule.LegacyESLint;
    ({ FlatESLint } = eslintModule);
  } else {
    ({ ESLint } = eslintModule);

    if (configType === "flat") {
      throw new Error(
        "Couldn't find FlatESLint, you might need to set eslintPath to 'eslint/use-at-your-own-risk'",
      );
    }
  }

  eslint =
    configType === "flat"
      ? new FlatESLint(eslintOptions)
      : new ESLint(eslintOptions);

  return eslint;
}

/**
 * @param {string | string[]} files files
 * @returns {Promise<LintResult[]>} lint results
 */
async function lintFiles(files) {
  /** @type {LintResult[]} */
  const result = await eslint.lintFiles(files);
  // if enabled, use eslint autofixing where possible
  if (fix) {
    await ESLint.outputFixes(result);
  }
  return result;
}

module.exports.lintFiles = lintFiles;
module.exports.setup = setup;
