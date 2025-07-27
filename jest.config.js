const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",  
  preset: "ts-jest",
  transform: {
    ...tsJestTransformCfg,
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
};