'use strict'

module.exports = {
  extends: "../.eslintrc.js",
  rules: {
    "func-names": 0,
    "no-unused-expressions": 0,
    "max-len": ["error", 120]
  },
  env: {
    node: true,
    mocha: true
  }
}
