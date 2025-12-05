export = applySuppressions;
/**
 * @param {LintResult[]} results results
 * @param {Options} options options
 * @returns {Promise<LintResult[]>} suppressed results
 */
declare function applySuppressions(
  results: LintResult[],
  options: Options,
): Promise<LintResult[]>;
declare namespace applySuppressions {
  export { LintResult, Options, SuppressedViolations, SuppressionsService };
}
type LintResult = import("eslint").ESLint.LintResult;
type Options = import("./options").Options;
type SuppressedViolations = Record<
  string,
  Record<
    string,
    {
      count: number;
    }
  >
>;
type SuppressionsService = new (options: { filePath: string; cwd: string }) => {
  load: () => Promise<SuppressedViolations>;
  applySuppressions: (
    results: LintResult[],
    suppressions: SuppressedViolations,
  ) => {
    results: LintResult[];
    unused: SuppressedViolations;
  };
};
