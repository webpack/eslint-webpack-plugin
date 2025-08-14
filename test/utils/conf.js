import { join } from "node:path";
import eslint from "eslint";

import ESLintPlugin from "../../src";

export default (entry, pluginConf = {}, webpackConf = {}) => {
  const testDir = join(__dirname, "..");

  return {
    entry: `./${entry}-entry.js`,
    context: join(testDir, "fixtures"),
    mode: "development",
    output: {
      path: join(testDir, "outputs"),
    },
    plugins: [
      new ESLintPlugin({
        // Do not cache for tests
        cache: false,
        configType:
          Number.parseFloat(eslint.ESLint.version) >= 9 ? "flat" : "eslintrc",
        overrideConfigFile:
          Number.parseFloat(eslint.ESLint.version) >= 9
            ? join(testDir, "./config-for-tests/eslint.config.mjs")
            : join(testDir, "./config-for-tests/.eslintrc.js"),
        // this disables the use of .eslintignore, since it contains the fixtures
        // folder to skip it on the global linting, but here we want the opposite
        ignore: false,
        // TODO: update tests to run both states: test.each([[{threads: false}], [{threads: true}]])('it should...', async ({threads}) => {...})
        threads: true,
        failOnError: false,
        ...pluginConf,
      }),
    ],
    ...webpackConf,
  };
};
