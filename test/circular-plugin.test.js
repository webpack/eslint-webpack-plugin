import { ESLint } from "eslint";
import pack from "./utils/pack";

(ESLint && Number.parseFloat(ESLint.version) < 9 ? describe.skip : describe)(
  "circular plugin",
  () => {
    // eslint-disable-next-line jest/require-top-level-describe
    test("should support plugins with circular configs", async () => {
      const plugin = {
        configs: {},
        rules: {},
        processors: {},
      };

      Object.assign(plugin.configs, {
        recommended: {
          plugins: {
            self: plugin,
          },
          rules: {},
        },
      });

      const loaderOptions = {
        configType: "flat",
        overrideConfig: {
          plugins: { plugin },
        },
        overrideConfigFile: true,
      };

      const compiler = pack("good", loaderOptions);

      const stats = await compiler.runAsync();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
    });
  },
);
