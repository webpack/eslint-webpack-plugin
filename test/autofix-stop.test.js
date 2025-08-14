import { join } from "node:path";

import { watch } from "chokidar";
import { copySync, removeSync } from "fs-extra";

import pack from "./utils/pack";

describe("autofix stop", () => {
  const entry = join(__dirname, "fixtures/nonfixable-clone.js");

  let changed = false;
  let watcher;

  beforeAll(() => {
    copySync(join(__dirname, "fixtures/nonfixable.js"), entry);

    watcher = watch(entry);
    watcher.on("change", () => {
      changed = true;
    });
  });

  afterAll(() => {
    watcher.close();
    removeSync(entry);
  });

  it("should not change file if there are no fixable errors/warnings", async () => {
    const compiler = pack("nonfixable-clone", { fix: true });

    await compiler.runAsync();
    expect(changed).toBe(false);
  });
});
