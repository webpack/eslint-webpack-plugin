import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import pack from "./utils/pack";

const testDir = join(__dirname, "fixtures");

describe("suppressions", () => {
  const suppressionsFile = join(testDir, "eslint-suppressions.json");

  afterEach(() => {
    if (existsSync(suppressionsFile)) {
      unlinkSync(suppressionsFile);
    }
  });

  it("should report errors when no suppressions file exists", async () => {
    const compiler = pack("suppressed-error", {
      cwd: testDir,
    });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });

  it("should suppress errors when suppressions file exists", async () => {
    // Create suppressions file that matches the violations in suppressed-error.js
    // The file has: var foo = undefinedVariable
    // Which triggers: no-var (error), no-undef (error), no-unused-vars (error)
    const suppressions = {
      "suppressed-error.js": {
        "no-var": { count: 1 },
        "no-undef": { count: 1 },
        "no-unused-vars": { count: 1 },
      },
    };

    writeFileSync(suppressionsFile, JSON.stringify(suppressions, null, 2));

    const compiler = pack("suppressed-error", {
      cwd: testDir,
    });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it("should support custom suppressionsLocation option", async () => {
    const customSuppressionsFile = join(testDir, "custom-suppressions.json");

    const suppressions = {
      "suppressed-error.js": {
        "no-var": { count: 1 },
        "no-undef": { count: 1 },
        "no-unused-vars": { count: 1 },
      },
    };

    writeFileSync(
      customSuppressionsFile,
      JSON.stringify(suppressions, null, 2),
    );

    try {
      const compiler = pack("suppressed-error", {
        cwd: testDir,
        suppressionsLocation: "custom-suppressions.json",
      });

      const stats = await compiler.runAsync();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
    } finally {
      if (existsSync(customSuppressionsFile)) {
        unlinkSync(customSuppressionsFile);
      }
    }
  });

  it("should still report unsuppressed errors", async () => {
    // Only suppress some of the violations, not suppressing no-undef and
    // no-unused-vars
    const suppressions = {
      "suppressed-error.js": {
        "no-var": { count: 1 },
      },
    };

    writeFileSync(suppressionsFile, JSON.stringify(suppressions, null, 2));

    const compiler = pack("suppressed-error", {
      cwd: testDir,
    });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });

  describe("with context as subdirectory", () => {
    const subdirTestDir = join(testDir, "subdir");
    const parentSuppressionsFile = join(testDir, "eslint-suppressions.json");

    afterEach(() => {
      if (existsSync(parentSuppressionsFile)) {
        unlinkSync(parentSuppressionsFile);
      }
    });

    it("should suppress errors with suppressionsLocation pointing to parent directory", async () => {
      // Suppressions file is at test/fixtures/eslint-suppressions.json
      // Context is test/fixtures/subdir/
      // suppressionsLocation is ../eslint-suppressions.json
      //
      // Paths in suppressions file are relative to the suppressions file location (test/fixtures/)
      const suppressions = {
        "subdir/suppressed-error.js": {
          "no-var": { count: 1 },
          "no-undef": { count: 1 },
          "no-unused-vars": { count: 1 },
        },
      };

      writeFileSync(
        parentSuppressionsFile,
        JSON.stringify(suppressions, null, 2),
      );

      const compiler = pack("subdir/suppressed-error", {
        context: subdirTestDir,
        suppressionsLocation: "../eslint-suppressions.json",
      });

      const stats = await compiler.runAsync();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
    });

    it("should suppress errors with absolute suppressionsLocation path", async () => {
      const suppressions = {
        "subdir/suppressed-error.js": {
          "no-var": { count: 1 },
          "no-undef": { count: 1 },
          "no-unused-vars": { count: 1 },
        },
      };

      writeFileSync(
        parentSuppressionsFile,
        JSON.stringify(suppressions, null, 2),
      );

      const compiler = pack("subdir/suppressed-error", {
        context: subdirTestDir,
        suppressionsLocation: parentSuppressionsFile, // Absolute path
      });

      const stats = await compiler.runAsync();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
    });

    it("should report errors when suppressionsLocation is relative but file does not exist", async () => {
      const compiler = pack("subdir/suppressed-error", {
        context: subdirTestDir,
        suppressionsLocation: "../nonexistent-suppressions.json",
      });

      const stats = await compiler.runAsync();
      expect(stats.hasErrors()).toBe(true);
    });
  });

  describe("with context omitted (defaults to webpack context)", () => {
    it("should suppress errors with default suppressionsLocation", async () => {
      const suppressions = {
        "suppressed-error.js": {
          "no-var": { count: 1 },
          "no-undef": { count: 1 },
          "no-unused-vars": { count: 1 },
        },
      };

      writeFileSync(suppressionsFile, JSON.stringify(suppressions, null, 2));

      const compiler = pack("suppressed-error", {});
      const stats = await compiler.runAsync();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
    });
  });
});
