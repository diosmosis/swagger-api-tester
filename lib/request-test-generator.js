'use strict'

const RequestTest = require('./request-test')

class RequestTestGenerator {
  constructor(swaggerSpec, method, path, body, headers) {
    this.requestTest = new RequestTest(swaggerSpec, method, path, body, headers)
  }

  respondsWith(statusCode, modelNameToValidate) {
    this.createMochaTest(statusCode, modelNameToValidate)
  }

  createMochaTest(statusCode, modelNameToValidate) {
    const self = this

    const testMessage = `should respond to ${this.requestTest.method} `
      + `${this.requestTest.path} correctly`

    it(testMessage, function * () {
      yield self.requestTest.respondsWith(statusCode, modelNameToValidate)
    })
  }
}

module.exports = RequestTestGenerator
