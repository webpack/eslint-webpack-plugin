export = ESLintError;
declare class ESLintError extends Error {
  /**
   * @param {string=} messages messages
   */
  constructor(messages?: string | undefined);
  stack: string;
}
