// Tests are plain TypeScript run in Node: the logic under test (composables, utils) does not
// touch the DOM or the network, so there is no .vue transform and no jsdom.
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests/unit"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
