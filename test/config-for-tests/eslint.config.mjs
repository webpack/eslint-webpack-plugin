import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig({
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
  rules: {
    "no-console": "warn",

    "no-undef": "error",
    "no-var": "error",
    "no-unused-vars": "error",
    "prefer-const": "error"
  }
});
