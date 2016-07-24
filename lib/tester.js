'use strict'

const SwaggerRequestTest = require('./request-test')

class Tester {
  constructor(swaggerSpec) {
    this.swaggerSpec = swaggerSpec
  }

  post(path, body, headers) {
    return this.request('POST', path, body, headers)
  }

  put(path, body, headers) {
    return this.request('PUT', path, body, headers)
  }

  get(path, headers) {
    return this.request('GET', path, null, headers)
  }

  del(path, body, headers) {
    return this.request('DELETE', path, body, headers)
  }

  request(method, path, body, headers) {
    return new SwaggerRequestTest(this.swaggerSpec, method, path, body, headers)
  }
}

module.exports = Tester
