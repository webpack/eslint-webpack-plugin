import eslint from "eslint";
import ESLintError from "../src/ESLintError";
import pack from "./utils/pack";

describe("eslintignore", () => {
  it("should ignores files present in .eslintignore", async () => {
    const pluginConfig =
      Number.parseFloat(eslint.ESLint.version) >= 9
        ? {
            ignore: true,
            ignorePatterns: ["**/ignore.js"],
          }
        : {
            ignore: true,
          };

    const compiler = pack("ignore", pluginConfig);

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(
      stats.compilation.errors.filter((x) => x instanceof ESLintError),
    ).toEqual([]);
  });
});
