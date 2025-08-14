import { join } from "node:path";

import pack from "./utils/pack";

describe("succeed on eslintrc-configuration", () => {
  it("should work with eslintrc configuration type", async () => {
    const overrideConfigFile = join(
      __dirname,
      "fixtures",
      "eslintrc-config.js",
    );
    const compiler = pack("full-of-problems", {
      configType: "eslintrc",
      overrideConfigFile,
      threads: 1,
    });

    const stats = await compiler.runAsync();
    const { errors } = stats.compilation;

    expect(stats.hasErrors()).toBe(true);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("full-of-problems.js");
  });
});
