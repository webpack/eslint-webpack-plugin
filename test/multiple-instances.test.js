import { join } from "node:path";
import eslint from "eslint";
import ESLintPlugin from "../src";
import pack from "./utils/pack";

const configType =
  Number.parseFloat(eslint.ESLint.version) >= 9 ? "flat" : "eslintrc";
const config =
  Number.parseFloat(eslint.ESLint.version) >= 9
    ? join(__dirname, "./config-for-tests/eslint.config.mjs")
    : join(__dirname, "./config-for-tests/.eslintrc.js");

describe("multiple instances", () => {
  it("should don't fail", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new ESLintPlugin({
            configType,
            overrideConfigFile: config,
            ignore: false,
            exclude: "error.js",
          }),
          new ESLintPlugin({
            configType,
            overrideConfigFile: config,
            ignore: false,
            exclude: "error.js",
          }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it("should fail on first instance", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new ESLintPlugin({
            configType,
            overrideConfigFile: config,
            ignore: false,
            exclude: "good.js",
          }),
          new ESLintPlugin({
            configType,
            overrideConfigFile: config,
            ignore: false,
            exclude: "error.js",
          }),
        ],
      },
    );

    await expect(compiler.runAsync()).rejects.toThrow("error.js");
  });

  it("should fail on second instance", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new ESLintPlugin({
            configType,
            overrideConfigFile: config,
            ignore: false,
            exclude: "error.js",
          }),
          new ESLintPlugin({
            configType,
            overrideConfigFile: config,
            ignore: false,
            exclude: "good.js",
          }),
        ],
      },
    );

    await expect(compiler.runAsync()).rejects.toThrow("error.js");
  });
});
