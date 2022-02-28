/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  reporters: [
    "default",
    /*
    ["./node_modules/jest-html-reporter", {
      pageTitle: "Test Report",
      includeFailureMsg: true
    }],*/
    ["jest-html-reporters", {
      publicPath: "./html-report",
      filename: "report.html",
      openReport: true
    }]
  ]
};