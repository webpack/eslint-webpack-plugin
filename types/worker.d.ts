export type ESLint = import("eslint").ESLint;
export type ESLintOptions = import("eslint").ESLint.Options;
export type LintResult = import("eslint").ESLint.LintResult;
export type ESLintClass = {
  new (arg0: ESLintOptions): ESLint;
  outputFixes: (arg0: LintResult[]) => void;
};
/**
 * @param {string | string[]} files files
 * @returns {Promise<LintResult[]>} lint results
 */
export function lintFiles(files: string | string[]): Promise<LintResult[]>;
/**
 * @param {object} options setup worker
 * @param {string=} options.eslintPath import path of eslint
 * @param {string=} options.configType a config type
 * @param {ESLintOptions} options.eslintOptions linter options
 * @returns {ESLint} eslint
 */
export function setup({
  eslintPath,
  configType,
  eslintOptions,
}: {
  eslintPath?: string | undefined;
  configType?: string | undefined;
  eslintOptions: ESLintOptions;
}): ESLint;
