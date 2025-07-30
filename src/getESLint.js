const { cpus } = require("node:os");

const { stringify } = require("flatted");
const { Worker: JestWorker } = require("jest-worker");

const { getESLintOptions } = require("./options");
const { jsonStringifyReplacerSortKeys } = require("./utils");
const { lintFiles, setup } = require("./worker");

/** @type {{ [key: string]: Linter }} */
const cache = {};

/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/** @typedef {import('./options').Options} Options */
/** @typedef {() => Promise<void>} AsyncTask */
/** @typedef {(files: string|string[]) => Promise<LintResult[]>} LintTask */
/** @typedef {{threads: number, eslint: ESLint, lintFiles: LintTask, cleanup: AsyncTask}} Linter */
/** @typedef {JestWorker & {lintFiles: LintTask}} Worker */

/**
 * @param {Options} options options
 * @returns {Promise<Linter>} linter
 */
async function loadESLint(options) {
  const { eslintPath } = options;
  const eslint = await setup({
    eslintPath,
    configType: options.configType,
    eslintOptions: getESLintOptions(options),
  });

  return {
    threads: 1,
    lintFiles,
    eslint,
    // no-op for non-threaded
    cleanup: async () => {},
  };
}

/**
 * @param {string | undefined} key a cache key
 * @param {Options} options options
 * @returns {string} a stringified cache key
 */
function getCacheKey(key, options) {
  return stringify({ key, options }, jsonStringifyReplacerSortKeys);
}

/**
 * @param {string | undefined} key a cache key
 * @param {number} poolSize number of workers
 * @param {Options} options options
 * @returns {Promise<Linter>} linter
 */
async function loadESLintThreaded(key, poolSize, options) {
  const cacheKey = getCacheKey(key, options);
  const { eslintPath = "eslint" } = options;
  const source = require.resolve("./worker");
  const workerOptions = {
    enableWorkerThreads: true,
    numWorkers: poolSize,
    setupArgs: [
      {
        eslintPath,
        configType: options.configType,
        eslintOptions: getESLintOptions(options),
      },
    ],
  };

  const local = await loadESLint(options);

  let worker =
    /** @type {Worker | null} */
    (new JestWorker(source, workerOptions));

  /** @type {Linter} */
  const context = {
    ...local,
    threads: poolSize,
    lintFiles: async (files) =>
      (worker && (await worker.lintFiles(files))) ||
      /* istanbul ignore next */ [],
    cleanup: async () => {
      cache[cacheKey] = local;
      context.lintFiles = (files) => local.lintFiles(files);
      if (worker) {
        worker.end();
        worker = null;
      }
    },
  };

  return context;
}

/**
 * @param {string | undefined} key a cache key
 * @param {Options} options options
 * @returns {Promise<Linter>} linter
 */
async function getESLint(key, { threads, ...options }) {
  const max =
    typeof threads !== "number"
      ? threads
        ? cpus().length - 1
        : 1
      : /* istanbul ignore next */
        threads;

  const cacheKey = getCacheKey(key, { threads, ...options });
  if (!cache[cacheKey]) {
    cache[cacheKey] =
      max > 1
        ? await loadESLintThreaded(key, max, options)
        : await loadESLint(options);
  }
  return cache[cacheKey];
}

module.exports = {
  getESLint,
  loadESLint,
  loadESLintThreaded,
};
