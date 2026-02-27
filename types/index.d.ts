export = ESLintWebpackPlugin;
declare class ESLintWebpackPlugin {
  /**
   * @param {Options=} options options
   */
  constructor(options?: Options | undefined);
  key: string;
  options: import("./options").PluginOptions;
  /**
   * @param {Compiler} compiler compiler
   * @param {Omit<Options, "resourceQueryExclude"> & { resourceQueryExclude: RegExp[] }} options options
   * @param {string[]} wanted wanted files
   * @param {string[]} exclude excluded files
   */
  run(
    compiler: Compiler,
    options: Omit<Options, "resourceQueryExclude"> & {
      resourceQueryExclude: RegExp[];
    },
    wanted: string[],
    exclude: string[],
  ): Promise<void>;
  /**
   * @param {Compiler} compiler compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
  /**
   * @param {Compiler} compiler compiler
   * @returns {string} context
   */
  getContext(compiler: Compiler): string;
}
declare namespace ESLintWebpackPlugin {
  export { Compiler, Module, NormalModule, Options };
}
type Compiler = import("webpack").Compiler;
type Module = import("webpack").Module;
type NormalModule = import("webpack").NormalModule;
type Options = import("./options").Options;
