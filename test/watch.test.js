import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { removeSync } from "fs-extra";

import pack from "./utils/pack";

const target = join(__dirname, "fixtures", "watch-entry.js");
const target2 = join(__dirname, "fixtures", "watch-leaf.js");
const targetExpectedPattern = expect.stringMatching(
  target.replaceAll("\\", "\\\\"),
);

describe("watch", () => {
  let watch;

  afterEach(() => {
    if (watch) {
      watch.close();
    }
    removeSync(target);
    removeSync(target2);
  });

  it("should watch", (done) => {
    const compiler = pack("good");

    watch = compiler.watch({}, (err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it("should watch with unique messages", (done) => {
    writeFileSync(target, "var foo = stuff\n");

    // eslint-disable-next-line no-use-before-define
    let next = firstPass;
    const compiler = pack("watch");
    watch = compiler.watch({}, (err, stats) => next(err, stats));

    function finish(err, stats) {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      const { errors } = stats.compilation;
      const [{ message }] = errors;
      expect(stats.hasErrors()).toBe(true);
      expect(message).toEqual(expect.stringMatching("prefer-const"));
      done();
    }

    function thirdPass(err, stats) {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      const { errors } = stats.compilation;
      expect(errors).toHaveLength(1);
      const [{ message }] = errors;
      expect(message).toEqual(targetExpectedPattern);
      expect(message).toEqual(expect.stringMatching("no-unused-vars"));
      // `prefer-const` fails here
      expect(message).toEqual(expect.stringMatching("prefer-const"));

      next = finish;

      writeFileSync(
        target,
        "/* eslint-disable no-unused-vars */\nconst foo = false;\n",
      );
    }

    function secondPass(err, stats) {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      const { errors } = stats.compilation;
      expect(errors).toHaveLength(1);
      const [{ message }] = errors;
      expect(message).toEqual(targetExpectedPattern);
      expect(message).toEqual(expect.stringMatching("no-unused-vars"));
      // `prefer-const` passes here
      expect(message).toEqual(expect.stringMatching("prefer-const"));
      expect(message).toEqual(expect.stringMatching("\\(4 errors,"));

      next = thirdPass;

      writeFileSync(
        target,
        "const x = require('./watch-leaf')\nconst foo = 0\n",
      );
    }

    function firstPass(err, stats) {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      const { errors } = stats.compilation;
      expect(errors).toHaveLength(1);
      const [{ message }] = errors;
      expect(message).toEqual(targetExpectedPattern);
      expect(message).toEqual(expect.stringMatching("\\(3 errors,"));

      next = secondPass;

      writeFileSync(target2, "let bar = false;\n");
      writeFileSync(
        target,
        "const x = require('./watch-leaf')\n\nconst foo = false;\n",
      );
    }
  });
});
