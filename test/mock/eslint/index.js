class ESLintMock {
  // Disabled because these are simplified mock methods.

  async lintFiles() {
    return [
      {
        filePath: "",
        messages: [
          {
            ruleId: "no-undef",
            severity: 2,
            message: "Fake error",
            line: 1,
            column: 11,
          },
        ],
        errorCount: 2,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        source: "",
      },
    ];
  }

  async loadFormatter() {
    return {
      format(results) {
        return JSON.stringify(results);
      },
    };
  }
}

ESLintMock.version = "9";

module.exports = {
  ESLint: ESLintMock,
  loadESLint: async () => ESLintMock,
};
