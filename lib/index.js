'use strict'

require('co-mocha') // make sure it's registered for the generated tests
const SwaggerRequestTestGenerator = require('./request-test-generator')
const Tester = require('./tester')
const SwaggerSpec = require('./swagger-spec')

class TestGenerator {
  constructor(swaggerUrl, optionsParam) {
    const options = optionsParam || {}

    this.swaggerSpec = new SwaggerSpec({
      swaggerUrl,
      baseUrl: options.baseUrl,
      defaultHeaders: options.baseHeaders,
    })
  }

  tester() {
    return new Tester(this.swaggerSpec)
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
    return new SwaggerRequestTestGenerator(this.swaggerSpec, method, path, body, headers)
  }
}

module.exports = TestGenerator
