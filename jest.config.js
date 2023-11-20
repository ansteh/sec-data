const TEST_PATHS = ["**/lib/**/unit/*.+(spec|test).js"];

module.exports = {
  modulePathIgnorePatterns: ["/node_modules/"],
  verbose: true,
  coverageProvider: "v8",
  testMatch: TEST_PATHS,
};
