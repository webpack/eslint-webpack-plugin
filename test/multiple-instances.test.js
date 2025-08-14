import { join } from "node:path";

import ESLintPlugin from "../src";

import pack from "./utils/pack";

describe("multiple instances", () => {
  it("should don't fail", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new ESLintPlugin({
            overrideConfigFile: join(
              __dirname,
              "./config-for-tests/eslint.config.mjs",
            ),
            ignore: false,
            exclude: "error.js",
          }),
          new ESLintPlugin({
            overrideConfigFile: join(
              __dirname,
              "./config-for-tests/eslint.config.mjs",
            ),
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
            overrideConfigFile: join(
              __dirname,
              "./config-for-tests/eslint.config.mjs",
            ),
            ignore: false,
            exclude: "good.js",
          }),
          new ESLintPlugin({
            overrideConfigFile: join(
              __dirname,
              "./config-for-tests/eslint.config.mjs",
            ),
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
            overrideConfigFile: join(
              __dirname,
              "./config-for-tests/eslint.config.mjs",
            ),
            ignore: false,
            exclude: "error.js",
          }),
          new ESLintPlugin({
            overrideConfigFile: join(
              __dirname,
              "./config-for-tests/eslint.config.mjs",
            ),
            ignore: false,
            exclude: "good.js",
          }),
        ],
      },
    );

    await expect(compiler.runAsync()).rejects.toThrow("error.js");
  });
});
