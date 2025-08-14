class ESLintError extends Error {
  /**
   * @param {string=} messages messages
   */
  constructor(messages) {
    super(`[eslint] ${messages}`);
    this.name = "ESLintError";
    this.stack = "";
  }
}

module.exports = ESLintError;
